import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    contents: `export * from './core/coins/ALEO/utils/recordUpgrade';
      export * from './app/scripts/background/helper/recordUpgrades';`,
    resolveDir: root,
  },
  bundle: true,
  write: false,
  format: "iife",
  globalName: "api",
  platform: "node",
});
const persistenceErrors = [];
const context = createContext({
  Error,
  console: { error: (...args) => persistenceErrors.push(args) },
});
runInContext(result.outputFiles[0].text, context);
const api = context.api;
const plaintext = (
  version = "0u8.public",
  amount = "10",
  nonce = "1group.public",
) =>
  `{ owner: aleo1synthetic.private, microcredits: ${amount}u64.private, _nonce: ${nonce}${
    version === null ? "" : `, _version: ${version}`
  } }`;
const record = (changes = {}) => ({
  commitment: "a",
  programId: "credits.aleo",
  plaintext: plaintext(),
  spent: false,
  ...changes,
});
const tx = (changes = {}) => ({
  localId: "tx",
  programId: "credits.aleo",
  functionName: "upgrade",
  inputs: [plaintext()],
  status: "Queued",
  timestamp: 1,
  ...changes,
});

test("detects explicit and omitted v0 without confusing nested fields or unknown versions", () => {
  assert.equal(api.getCreditsRecordVersion(plaintext()), 0);
  assert.equal(api.getCreditsRecordVersion(plaintext(null)), 0);
  assert.equal(api.getCreditsRecordVersion(plaintext("1u8.public")), 1);
  assert.equal(api.getCreditsRecordVersion(plaintext("2u8.public")), 2);
  assert.equal(api.getCreditsRecordVersion(plaintext("wrong")), undefined);
  assert.equal(
    api.getCreditsRecordVersion(
      "{ data: { _version: 1u8.public }, _nonce: 1group.public }",
    ),
    0,
  );
});

test("upgrade selection includes only unique unspent legacy credits records", () => {
  const rows = api.getLegacyCreditsRecords([
    record(),
    record(),
    record({ commitment: "b", plaintext: plaintext(null) }),
    record({ commitment: "c", spent: true }),
    record({ commitment: "d", programId: "other.aleo" }),
    record({ commitment: "e", plaintext: plaintext("1u8.public") }),
  ]);
  assert.deepEqual(
    Array.from(rows, (r) => r.commitment),
    ["a", "b"],
  );
});

test("upgrade validation preserves amount and enforces the on-chain record limit", () => {
  assert.equal(api.validateCreditsRecordUpgrade(plaintext(null, "123")), "123");
  assert.equal(
    api.validateCreditsRecordUpgrade(plaintext("0u8.public", "1000000000000")),
    "1000000000000",
  );
  assert.throws(
    () =>
      api.validateCreditsRecordUpgrade(
        plaintext("0u8.public", "1000000000001"),
      ),
    /at most/,
  );
  assert.throws(
    () => api.validateCreditsRecordUpgrade(plaintext("1u8.public")),
    /Only legacy/,
  );
  assert.throws(() => api.validateCreditsRecordUpgrade("{}"), /Only legacy/);
});

test("ordinary execution and private fees reject legacy credits before proving", () => {
  for (const fn of [
    "join",
    "split",
    "transfer_private",
    "transfer_private_to_public",
  ]) {
    assert.throws(
      () =>
        api.assertCreditsRecordsUpgraded(
          "credits.aleo",
          fn,
          [plaintext()],
          null,
        ),
      /must be upgraded/,
    );
  }
  assert.throws(
    () =>
      api.assertCreditsRecordsUpgraded(
        "other.aleo",
        "run",
        [],
        plaintext(null),
      ),
    /must be upgraded/,
  );
  assert.doesNotThrow(() =>
    api.assertCreditsRecordsUpgraded(
      "credits.aleo",
      "upgrade",
      [plaintext()],
      null,
    ),
  );
  assert.doesNotThrow(() =>
    api.assertCreditsRecordsUpgraded("other.aleo", "run", [plaintext()], null),
  );
  assert.doesNotThrow(() =>
    api.assertCreditsRecordsUpgraded(
      "credits.aleo",
      "join",
      [plaintext("1u8.public")],
      null,
    ),
  );
});

test("pending and broadcast upgrades cannot be resubmitted; failed records can retry", () => {
  const current = record();
  const before = tx({ timestamp: 1, status: "Failed" });
  const latest = tx({
    timestamp: 2,
    status: "Completed",
    inputs: [plaintext().replaceAll(",", ",\n")],
  });
  assert.equal(
    api.getRecordUpgradeTransaction(current, [before, latest]),
    latest,
  );
  for (const status of [
    "Queued",
    "Generating Transaction",
    "Broadcasting",
    "Completed",
    "Finalized",
  ]) {
    assert.equal(api.isRecordUpgradeInProgress(tx({ status })), true);
  }
  for (const status of ["Failed", "Rejected", "Unaccepted"])
    assert.equal(api.isRecordUpgradeInProgress(tx({ status })), false);
  assert.equal(
    api.getRecordUpgradeTransaction(current, [
      tx({ inputs: [plaintext("0u8.public", "10", "2group.public")] }),
    ]),
    undefined,
  );
});

test("background batch waits for each broadcast, continues past failures, and records errors", async () => {
  const order = [],
    failed = [];
  let active = 0;
  await api.runRecordUpgrades(
    [
      tx({ localId: "a" }),
      tx({ localId: "b" }),
      tx({ localId: "c" }),
      tx({ localId: "d" }),
    ],
    async (row) => {
      assert.equal(active++, 0);
      order.push(row.localId);
      await Promise.resolve();
      active--;
      if (row.localId === "a") throw new Error("proof failed");
      if (row.localId === "b")
        return { payload: { error: "broadcast failed", data: null } };
      if (row.localId === "c") return undefined;
      return { payload: { error: null, data: "at1synthetic" } };
    },
    async (row) => {
      failed.push(row);
    },
  );
  assert.deepEqual(order, ["a", "b", "c", "d"]);
  assert.deepEqual(
    failed.map((row) => row.localId),
    ["a", "b", "c"],
  );
  assert.ok(failed.every((row) => row.status === "Failed"));
  assert.equal(failed[0].error, "proof failed");
});

test("a failed error-status write does not abandon the remaining upgrade queue", async () => {
  const sent = [];
  const errorsBefore = persistenceErrors.length;
  await api.runRecordUpgrades(
    [tx({ localId: "a" }), tx({ localId: "b" })],
    async (row) => {
      sent.push(row.localId);
      if (row.localId === "a") throw new Error("proof failed");
      return { payload: { data: "at1synthetic" } };
    },
    async () => {
      throw new Error("database unavailable");
    },
  );
  assert.deepEqual(sent, ["a", "b"]);
  assert.equal(persistenceErrors.length, errorsBefore + 1);
});
