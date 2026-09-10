import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext, SourceTextModule } from "node:vm";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";
import { createJiti } from "jiti";
import { createServer } from "vite";
import {
  cryptoBoxKeyPair,
  cryptoBoxSealOpen,
} from "@serenity-kit/noble-sodium";

const root = fileURLToPath(new URL("../", import.meta.url));

test(
  "the Vite-served scanner worker loads without Node globals and encrypts an SDK registration",
  { timeout: 30000 },
  async () => {
    const cacheDir = await mkdtemp(join(root, "node_modules/.vite-aleo-test-"));
    const config = await createJiti(import.meta.url).import(
      join(root, "wxt.config.ts"),
      { default: true },
    );
    const viteConfig = await config.vite({
      mode: "development",
      command: "serve",
    });
    const server = await createServer({
      ...viteConfig,
      configFile: false,
      root,
      cacheDir,
      publicDir: join(root, "public"),
      resolve: {
        ...viteConfig.resolve,
        alias: { ...config.alias, ...viteConfig.resolve.alias },
      },
      // Reproduce a worker loaded after the initial HTML scan has completed.
      // Only dependencies explicitly included by the real config are prebundled.
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        entries: [],
        noDiscovery: true,
      },
      server: { host: "127.0.0.1", port: 0, watch: null },
      logLevel: "error",
    });
    try {
      await server.listen();
      const origin = server.resolvedUrls.local[0];
      const workerUrl = new URL(
        "offscreen_service/src/scannerWorker.ts?worker_file&type=module",
        origin,
      ).href;
      const messages = [],
        handlers = [];
      const context = createContext({
        URL,
        Response,
        Request,
        Headers,
        TextEncoder,
        TextDecoder,
        crypto: webcrypto,
        console,
        setTimeout,
        clearTimeout,
        performance,
        location: new URL(workerUrl),
        navigator: { hardwareConcurrency: 2 },
        fetch: (input, options) => fetch(new URL(input, origin), options),
        postMessage: (message) => messages.push(message),
        addEventListener: (type, handler) => {
          if (type === "message") handlers.push(handler);
        },
      });
      runInContext("self = globalThis", context);
      const modules = new Map();
      function loadModule(url) {
        if (!modules.has(url)) {
          modules.set(
            url,
            (async () => {
              const response = await fetch(url);
              assert.equal(response.status, 200, url);
              return new SourceTextModule(await response.text(), {
                context,
                identifier: url,
                initializeImportMeta(meta) {
                  meta.url = url;
                },
                async importModuleDynamically(specifier, parent) {
                  const mod = await loadModule(
                    new URL(specifier, parent.identifier).href,
                  );
                  if (mod.status === "unlinked") await mod.link(linker);
                  if (mod.status === "linked") await mod.evaluate();
                  return mod;
                },
              });
            })(),
          );
        }
        return modules.get(url);
      }
      const linker = (specifier, parent) =>
        loadModule(new URL(specifier, parent.identifier).href);
      const worker = await loadModule(workerUrl);
      await worker.link(linker);
      await worker.evaluate();
      assert.equal(messages[0]?.type, "ready");
      assert.ok(
        [...modules.keys()].some((url) => /@provablehq_sdk_mainnet/.test(url)),
        "SDK must be prebundled in development",
      );
      assert.equal(runInContext("typeof require", context), "undefined");

      // Public synthetic fixture derived from bytes 0..31, never wallet data.
      const viewKey = "AViewKey1rApaF4KWFZ6rTLvwMpLxcwuFCBom9vYXdtFJBiTH6Mkn";
      const keys = cryptoBoxKeyPair();
      const start = 123456;
      const task = {
        id: 1,
        type: "encryptRegistration",
        payload: {
          publicKey: Buffer.from(keys.publicKey).toString("base64"),
          viewKey,
          start,
        },
      };
      for (const handler of handlers) handler({ data: task });
      const result = messages.find((message) => message.id === task.id);
      assert.equal(result?.error, null);
      const plaintext = cryptoBoxSealOpen({
        ciphertext: new Uint8Array(
          Buffer.from(result.data.ciphertext, "base64"),
        ),
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
      });
      assert.equal(plaintext.length, 36);
      assert.equal(
        new DataView(plaintext.buffer, plaintext.byteOffset).getUint32(
          32,
          true,
        ),
        start,
      );
      // The SDK encodes the 32-byte little-endian view key, followed by start.
      // Use the already evaluated WASM binding imported by the SDK (including its cache query).
      const loadedWasm = await Promise.all([...modules.values()]);
      const binding = loadedWasm.find(
        (mod) =>
          /wasm\/dist\/mainnet\/index.js/.test(mod.identifier) &&
          mod.status === "evaluated",
      );
      assert.ok(binding);
      const parsed = binding.namespace.ViewKey.from_string(viewKey);
      try {
        assert.deepEqual([...plaintext.slice(0, 32)], [...parsed.toBytesLe()]);
      } finally {
        parsed.free();
      }
    } finally {
      await server.close();
      await rm(cacheDir, { recursive: true, force: true });
    }
  },
);
