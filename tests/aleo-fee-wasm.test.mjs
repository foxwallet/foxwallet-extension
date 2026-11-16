import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
test("official WASM estimates credits and imported programs without leaking consumed imports", async () => {
  const dir = await mkdtemp(join(tmpdir(), "aleo-fee-wasm-"));
  const savedFetch = globalThis.fetch;
  const savedSelf = globalThis.self;
  try {
    const outfile = join(dir, "estimate.mjs");
    await build({
      absWorkingDir: root,
      stdin: {
        contents:
          'export { estimateExecutionFee } from "./core/coins/ALEO/service/fee/estimate"; export { Program } from "provable-wasm-no-tla/mainnet.js"; export { initAleoWasm } from "./core/coins/ALEO/utils/wasmInit";',
        resolveDir: root,
        loader: "ts",
      },
      outfile,
      bundle: true,
      format: "esm",
      platform: "browser",
      define: { "import.meta.url": "self.location.href" },
    });
    globalThis.self = {
      location: { href: "chrome-extension://fee-test/assets/worker.js" },
    };
    globalThis.fetch = async (url) => {
      const path = new URL(url).pathname;
      assert.match(path, /^\/aleo_wasm_mainnet_[\d.]+\.wasm$/);
      return new Response(await readFile(join(root, "public", path.slice(1))), {
        headers: { "Content-Type": "application/wasm" },
      });
    };
    const { estimateExecutionFee, Program, initAleoWasm } = await import(
      pathToFileURL(outfile)
    );
    await initAleoWasm();
    const creditsProgram = Program.getCreditsProgram();
    const credits = creditsProgram.toString();
    creditsProgram.free();
    for (let i = 0; i < 2; i++) {
      const fee = await estimateExecutionFee({
        programs: [{ id: "credits.aleo", source: credits, edition: 0 }],
        functionName: "transfer_public",
      });
      assert.equal(fee, 2725n);
    }
    const helper = {
      id: "fee_helper.aleo",
      edition: 0,
      source:
        "program fee_helper.aleo;\nfunction calculate:\n    input r0 as u64.public;\n    add r0 1u64 into r1;\n    output r1 as u64.public;\n",
    };
    const program = {
      id: "fee_test.aleo",
      edition: 1,
      source:
        "import fee_helper.aleo;\nprogram fee_test.aleo;\nfunction run:\n    input r0 as u64.public;\n    call fee_helper.aleo/calculate r0 into r1;\n    output r1 as u64.public;\n",
    };
    const fee = await estimateExecutionFee({
      programs: [helper, program],
      functionName: "run",
    });
    assert.ok(fee > 0n);
    await assert.rejects(
      estimateExecutionFee({
        programs: [helper, program],
        functionName: "missing",
      }),
    );
    assert.equal(
      await estimateExecutionFee({
        programs: [helper, program],
        functionName: "run",
      }),
      fee,
    );
  } finally {
    globalThis.fetch = savedFetch;
    globalThis.self = savedSelf;
    await rm(dir, { recursive: true, force: true });
  }
});
