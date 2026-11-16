import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext, SourceTextModule } from "node:vm";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";
import { createJiti } from "jiti";
import { createServer } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));

test(
  "the Vite-served fee worker estimates with official WASM and returns errors",
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
        "core/coins/ALEO/service/fee/worker.ts?worker_file&type=module",
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
      assert.equal(runInContext("typeof require", context), "undefined");
      // Obtain the built-in native program from the fee worker's initialized binding.
      const bindings = await Promise.all([...modules.values()]);
      const binding = bindings.find(
        (mod) =>
          /provable-wasm-no-tla/.test(mod.identifier) &&
          "Program" in mod.namespace,
      );
      assert.ok(binding);
      await binding.namespace.default();
      const credits = binding.namespace.Program.getCreditsProgram();
      const request = {
        programs: [
          { id: "credits.aleo", source: credits.toString(), edition: 0 },
        ],
        functionName: "transfer_public",
      };
      credits.free();
      for (const handler of handlers) handler({ data: request });
      const deadline = Date.now() + 10000;
      while (messages.length === 0 && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(messages[0]?.fee, "2725");
      assert.equal(messages[0]?.error, undefined);
      for (const handler of handlers)
        handler({ data: { ...request, functionName: "missing" } });
      while (messages.length < 2 && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(typeof messages[1]?.error, "string");
    } finally {
      await server.close();
      await rm(cacheDir, { recursive: true, force: true });
    }
  },
);
