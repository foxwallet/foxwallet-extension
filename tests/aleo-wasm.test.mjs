import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { Worker as NodeWorker } from "node:worker_threads";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const { dependencies } = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);
const version = dependencies["@provablehq/sdk"];
// Captured with the previous bindings using public, synthetic bytes 0..31.
const fixture = {
  privateKey: "APrivateKey1zkpK1eMknpZPRUxWg9VwGVjWcwY7ufxUvH72wp57T4fgTGf",
  viewKey: "AViewKey1rApaF4KWFZ6rTLvwMpLxcwuFCBom9vYXdtFJBiTH6Mkn",
  address: "aleo1nxl6ymg85vyh3z5y486rp82cgkeyvun8qwqxdncl8489s9ht55qqqc6fll",
};

async function bundle(dir, name, contents) {
  const outfile = path.join(dir, `${name}.mjs`);
  await build({
    stdin: {
      contents,
      resolveDir: root,
      sourcefile: `${name}.ts`,
      loader: "ts",
    },
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "chrome120",
    outfile,
    // Match WXT's import.meta.url transformation in popup/background/workers.
    define: { "import.meta.url": "self.location.href" },
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile));
}

test("Aleo bindings initialize from extension-root assets and preserve keys", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "foxwallet-wasm-test-"));
  const saved = {
    fetch: globalThis.fetch,
    self: globalThis.self,
    Worker: globalThis.Worker,
  };
  const workers = [];
  const requests = [];
  const workerUrls = [];
  let failNext = false;
  globalThis.self = {
    location: { href: "chrome-extension://test-wallet/assets/background.js" },
  };
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    requests.push(url.pathname);
    assert.equal(url.origin, "null"); // custom extension scheme
    assert.equal(url.hostname, "test-wallet");
    assert.match(
      url.pathname,
      new RegExp(
        `^/aleo_wasm_(mainnet|testnet)_${version.replaceAll(".", "\\.")}.wasm$`,
      ),
    );
    if (failNext) {
      failNext = false;
      throw new Error("simulated WASM load failure");
    }
    const bytes = await fs.readFile(
      path.join(root, "public", url.pathname.slice(1)),
    );
    return new Response(bytes, {
      headers: { "Content-Type": "application/wasm" },
    });
  };
  globalThis.Worker = class {
    constructor(input, options) {
      const url = new URL(input);
      workerUrls.push(url.pathname);
      assert.equal(options.type, "module");
      assert.match(
        url.pathname,
        new RegExp(
          `^/worker_(mainnet|testnet)_${version.replaceAll(".", "\\.")}.js$`,
        ),
      );
      // Adapt browser messaging to real Node worker threads; execute the shipped pool worker.
      const code = `
        const { parentPort, workerData } = require('node:worker_threads');
        globalThis.addEventListener = (type, handler, options) => {
          if (type === 'message') parentPort[options?.once ? 'once' : 'on']('message', data => handler({ data }));
        };
        globalThis.postMessage = data => parentPort.postMessage(data);
        globalThis.close = () => parentPort.close();
        import(workerData);
      `;
      this.worker = new NodeWorker(code, {
        eval: true,
        workerData: pathToFileURL(
          path.join(root, "public", url.pathname.slice(1)),
        ).href,
      });
      workers.push(this.worker);
    }
    addEventListener(type, callback, options) {
      if (type === "message")
        this.worker[options?.once ? "once" : "on"]("message", (data) =>
          callback({ data }),
        );
    }
    postMessage(data) {
      this.worker.postMessage(data);
    }
    unref() {
      this.worker.unref();
    }
  };
  try {
    const mainnet = await bundle(
      dir,
      "mainnet",
      `
      export * from './core/coins/ALEO/utils/wasmInit';
      export { PrivateKey, ViewKey, Address, Signature } from 'provable-wasm-no-tla/mainnet.js';
    `,
    );
    assert.equal(
      requests.length,
      0,
      "import must not initialize WASM at top level",
    );
    assert.throws(mainnet.assertAleoWasmReady, /not initialized/);
    failNext = true;
    await assert.rejects(mainnet.initAleoWasm(), /simulated WASM load failure/);
    assert.throws(mainnet.assertAleoWasmReady, /not initialized/);
    const first = mainnet.initAleoWasm();
    await Promise.all([first, mainnet.initAleoWasm(), mainnet.initAleoWasm()]);
    mainnet.assertAleoWasmReady();
    await mainnet.initAleoWasm();
    assert.equal(
      requests.length,
      2,
      "one failed load and one successful load, without a second default fetch",
    );

    const seed = Uint8Array.from({ length: 32 }, (_, i) => i);
    const pk = mainnet.PrivateKey.from_seed_unchecked(seed);
    assert.equal(pk.to_string(), fixture.privateKey);
    assert.equal(pk.to_view_key().to_string(), fixture.viewKey);
    assert.equal(pk.to_address().to_string(), fixture.address);
    assert.equal(
      mainnet.PrivateKey.from_string(fixture.privateKey)
        .to_address()
        .to_string(),
      fixture.address,
    );
    const message = new TextEncoder().encode("wallet SDK migration test");
    const signature = mainnet.Signature.sign(pk, message);
    assert.equal(
      signature.verify(mainnet.Address.from_string(fixture.address), message),
      true,
    );

    const testnet = await bundle(
      dir,
      "testnet",
      `export { default, PrivateKey } from 'provable-wasm-no-tla/testnet.js';`,
    );
    assert.equal(requests.length, 2);
    await testnet.default();
    assert.equal(
      testnet.PrivateKey.from_seed_unchecked(seed).to_address().to_string(),
      fixture.address,
    );

    for (const network of ["mainnet", "testnet"]) {
      await t.test(
        `${network} SDK loads its official WASM and starts the packaged pool worker`,
        { timeout: 30000 },
        async () => {
          const sdk = await bundle(
            dir,
            `sdk-${network}`,
            `export { PrivateKey, initThreadPool, encryptRegistrationRequest } from '@provablehq/sdk/${network}.js';`,
          );
          assert.equal(
            sdk.PrivateKey.from_string(fixture.privateKey)
              .to_address()
              .to_string(),
            fixture.address,
          );
          assert.equal(typeof sdk.encryptRegistrationRequest, "function");
          await sdk.initThreadPool(2);
          assert.equal(workerUrls.at(-1), `/worker_${network}_${version}.js`);
        },
      );
    }
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
    Object.assign(globalThis, saved);
    await fs.rm(dir, { recursive: true, force: true });
  }
});
