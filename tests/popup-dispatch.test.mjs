import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    contents:
      "export { PopupServerHandler } from './app/scripts/background/handlers/PopupServerHandler';",
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  write: false,
  format: "iife",
  globalName: "api",
  platform: "browser",
  target: "es2022",
  tsconfig: `${root}tsconfig.json`,
  plugins: [
    {
      name: "popup-dispatch-fixtures",
      setup(api) {
        api.onResolve({ filter: /^webextension-polyfill$/ }, () => ({
          path: "browser",
          namespace: "fixture",
        }));
        api.onResolve({ filter: /\/IWalletServer$/ }, () => ({
          path: "server-method",
          namespace: "fixture",
        }));
        api.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
          contents:
            path === "browser"
              ? "export default globalThis.browser;"
              : "export async function executeServerMethod(promise) { try { return { error: null, data: await promise }; } catch (error) { return { error: { message: error.message }, data: null }; } }",
        }));
      },
    },
  ],
});

function harness(senderUrl = "chrome-extension://wallet/index.html") {
  const messages = [];
  const browser = {
    runtime: {
      id: "wallet",
      getURL: (page) => `chrome-extension://wallet/${page}`,
    },
  };
  const context = createContext({ browser, console, setTimeout, clearTimeout });
  runInContext(bundle.outputFiles[0].text, context);
  const calls = [];
  const server = {
    clearTimeoutLock: async () => {},
    timeoutLock: async () => {},
    getPrivateKey: async (payload) => {
      calls.push(payload);
      return "key";
    },
  };
  const port = {
    sender: { id: "wallet", url: senderUrl },
    disconnect() {
      this.disconnected = true;
    },
    postMessage: (message) => messages.push(message),
    onMessage: {
      addListener(callback) {
        port.receive = callback;
      },
    },
    onDisconnect: { addListener() {} },
  };
  new context.api.PopupServerHandler(server).handle(port);
  return { port, calls, messages };
}

const request = (method) => ({
  type: "request",
  id: method,
  origin: "popup_to_background",
  method,
  payload: { walletId: "wallet-1" },
});

test("popup dispatch accepts an explicit API method", async () => {
  const { port, calls, messages } = harness();
  await port.receive(request("getPrivateKey"));
  assert.equal(calls.length, 1);
  assert.equal(messages[0].payload.data, "key");
});

test("popup dispatch rejects inherited and internal methods", async () => {
  const { port, calls, messages } = harness();
  for (const method of [
    "constructor",
    "toString",
    "clearTimeoutLock",
    "getPrivateKeyByAddress",
  ]) {
    await port.receive(request(method));
  }
  assert.equal(calls.length, 0);
  assert.equal(messages.length, 4);
  assert(
    messages.every(
      ({ payload }) => payload.error?.message === "Unsupported popup method",
    ),
  );
});

test("popup dispatch disconnects a content-script sender", () => {
  const { port } = harness("https://example.com/");
  assert.equal(port.disconnected, true);
  assert.equal(port.receive, undefined);
});
