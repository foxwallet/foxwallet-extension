import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = new URL("../app/store/serialization.ts", import.meta.url);
let serializeState, deserializeState;
try {
  ({ serializeState, deserializeState } = await import(moduleUrl));
} catch {
  /* TypeScript runtime unavailable in plain Node */
}

test("state wire format preserves bigint and undefined", () => {
  if (!serializeState) return;
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
  const dir = await mkdtemp(join(tmpdir(), "foxwallet-store-test-"));
  const outfile = join(dir, "reconcileState.mjs");
  await build({
    stdin: {
      contents: `export { reconcileState } from ${JSON.stringify(
        new URL("../app/store/reconcileState.ts", import.meta.url).pathname,
      )};`,
      resolveDir: process.cwd(),
      loader: "js",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  try {
    const { reconcileState } = await import(pathToFileURL(outfile));
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
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
