import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function loadStoreModule(relativePath) {
  const dir = await mkdtemp(join(tmpdir(), "foxwallet-store-test-"));
  const outfile = join(dir, "module.mjs");
  try {
    await build({
      entryPoints: [fileURLToPath(new URL(relativePath, import.meta.url))],
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("state wire format preserves bigint and undefined", async () => {
  const { serializeState, deserializeState } = await loadStoreModule(
    "../app/store/serialization.ts",
  );
  const input = {
    total: 12345678901234567890n,
    missing: undefined,
    nested: [0n],
  };
  const output = deserializeState(serializeState(input));
  assert.equal(output.total, input.total);
  assert.equal(output.missing, undefined);
  assert.deepEqual(output.nested, [0n]);
});

test("state mirror preserves unchanged branch identity", async () => {
  const { reconcileState } = await loadStoreModule(
    "../app/store/reconcileState.ts",
  );
  const previous = {
    account: { selected: "account-1", wallets: [{ id: "wallet-1" }] },
    tokens: { aleo: { balance: 1n } },
  };
  const incoming = {
    account: { selected: "account-1", wallets: [{ id: "wallet-1" }] },
    tokens: { aleo: { balance: 2n } },
  };
  const next = reconcileState(previous, incoming);
  assert.notEqual(next, previous);
  assert.equal(next.account, previous.account);
  assert.equal(next.account.wallets, previous.account.wallets);
  assert.notEqual(next.tokens, previous.tokens);
  assert.notEqual(next.tokens.aleo, previous.tokens.aleo);
  assert.equal(reconcileState(previous, structuredClone(previous)), previous);
});
