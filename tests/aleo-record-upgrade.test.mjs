import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
// Exercise the production history method without loading signing/scanner dependencies.
const serviceSource = ts.createSourceFile(
  "AleoService.ts",
  await readFile(root + "core/coins/ALEO/service/AleoService.ts", "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const historyMethod = serviceSource.statements
  .find(
    (node) => ts.isClassDeclaration(node) && node.name?.text === "AleoService",
  )
  ?.members.find(
    (node) =>
      ts.isMethodDeclaration(node) &&
      node.name.getText(serviceSource) === "processLocalTxInfo",
  );
assert.ok(historyMethod, "AleoService.processLocalTxInfo must exist");
const result = await build({
  stdin: {
    contents: `export * from './core/coins/ALEO/utils/recordUpgrade';
      export * from './app/scripts/background/helper/recordUpgrades';
      import { AleoTxStatus } from './core/coins/ALEO/types/Transaction';
      import { AleoHistoryType, AleoTxAddressType, AleoTxType } from './core/coins/ALEO/types/History';
      import { LOCAL_TX_EXPIRE_TIME } from './core/coins/ALEO/constants';
      export class LocalHistoryFixture { ${historyMethod.getText(
        serviceSource,
      )} }`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  write: false,
  format: "iife",
  globalName: "api",
  platform: "node",
});
const persistenceErrors = [];
const retryDelays = [];
const context = createContext({
  Error,
  setTimeout: (callback, milliseconds) => {
    retryDelays.push(milliseconds);
    callback();
  },
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

test("unsupported records stay visible without blocking supported upgrade candidates", () => {
  const eligible = record({
    plaintext: plaintext("0u8.public", "1000000000000"),
  });
  const oversized = record({
    commitment: "too-large",
    plaintext: plaintext("0u8.public", "1000000000001"),
  });
  const malformed = record({
    commitment: "malformed",
    plaintext: "{ microcredits: 1u64.private, _version: 0u8.public }",
  });
  const selection = api.getCreditsRecordUpgradeCandidates([
    oversized,
    eligible,
    malformed,
    record({ commitment: "current", plaintext: plaintext("1u8.public") }),
    eligible,
  ]);
  assert.deepEqual(Array.from(selection.upgradeableRecords), [eligible]);
  assert.deepEqual(Array.from(selection.legacyRecords), [
    oversized,
    eligible,
    malformed,
  ]);
  assert.equal(selection.unsupportedRecords.length, 2);
  assert.equal(selection.unsupportedRecords[0].record, oversized);
  assert.match(selection.unsupportedRecords[0].error, /1,000,000 ALEO/);
  assert.equal(selection.unsupportedRecords[1].record, malformed);
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

test("a failed error-status write retries with bounded backoff and continues the queue", async () => {
  const sent = [];
  const errorsBefore = persistenceErrors.length;
  const delaysBefore = retryDelays.length;
  let writes = 0;
  await api.runRecordUpgrades(
    [tx({ localId: "a" }), tx({ localId: "b" })],
    async (row) => {
      sent.push(row.localId);
      if (row.localId === "a") throw new Error("proof failed");
      return { payload: { data: "at1synthetic" } };
    },
    async () => {
      writes++;
      throw new Error("database unavailable");
    },
  );
  assert.deepEqual(sent, ["a", "b"]);
  assert.equal(writes, 3);
  assert.deepEqual(retryDelays.slice(delaysBefore), [250, 500]);
  assert.equal(persistenceErrors.length, errorsBefore + 1);
});

test("a transient failed-status write recovers before the next upgrade without resending", async () => {
  const order = [];
  const errorsBefore = persistenceErrors.length;
  let writes = 0;
  await api.runRecordUpgrades(
    [tx({ localId: "a" }), tx({ localId: "b" })],
    async (row) => {
      order.push(`send:${row.localId}`);
      if (row.localId === "a") throw new Error("proof failed");
      return { payload: { data: "at1synthetic" } };
    },
    async (row) => {
      order.push(`save:${row.localId}`);
      assert.equal(row.status, "Failed");
      assert.equal(row.error, "proof failed");
      if (++writes === 1) throw new Error("database busy");
    },
  );
  assert.deepEqual(order, ["send:a", "save:a", "save:a", "send:b"]);
  assert.equal(persistenceErrors.length, errorsBefore);
});

test("history expiration starts at broadcast time and supports older local rows", async () => {
  const now = Date.now();
  for (const [timestamps, expectedStatus] of [
    [{ timestamp: now - 1_200_000, broadcastAt: now }, "Completed"],
    [{ timestamp: now - 1_200_000, broadcastAt: now - 600_001 }, "Unaccepted"],
    [{ timestamp: now - 1_200_000 }, "Unaccepted"],
    [{ timestamp: now }, "Completed"],
  ]) {
    const saved = [];
    const service = new api.LocalHistoryFixture();
    service.chainId = "mainnet";
    service.getTxInfoOnChain = async () => {
      throw new Error("not yet indexed");
    };
    service.aleoStorage = {
      setAddressLocalTx: async (_, __, row) => saved.push(row),
    };
    const original = tx({
      ...timestamps,
      status: "Completed",
      transaction: { id: "at1synthetic" },
    });
    const history = await service.processLocalTxInfo(
      "aleo1synthetic",
      original,
    );
    assert.equal(history.status, expectedStatus);
    assert.equal(
      history.timestamp,
      original.timestamp,
      "history preserves queue time",
    );
    assert.equal(saved.length, expectedStatus === "Unaccepted" ? 1 : 0);
    if (saved.length) {
      assert.equal(saved[0].status, "Unaccepted");
      assert.equal(saved[0].broadcastAt, original.broadcastAt);
    }
  }
});
