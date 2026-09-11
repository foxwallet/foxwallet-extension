import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url).pathname;

async function loadConfirmUI(browser) {
  const dir = await mkdtemp(join(tmpdir(), "foxwallet-sidepanel-test-"));
  const outfile = join(dir, "confirmUI.mjs");
  await build({
    entryPoints: [join(root, "app/scripts/background/helper/confirmUI.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    plugins: [
      {
        name: "sidepanel-test-mocks",
        setup(api) {
          api.onResolve({ filter: /^webextension-polyfill$/ }, () => ({
            path: "browser",
            namespace: "sidepanel-test",
          }));
          api.onLoad(
            { filter: /^browser$/, namespace: "sidepanel-test" },
            () => ({
              contents: "export default globalThis.__testBrowser;",
              loader: "js",
            }),
          );
          api.onResolve({ filter: /^@\// }, ({ path }) => ({
            path: `${join(root, "app", path.slice(2))}.ts`,
          }));
          api.onResolve({ filter: /^\.\/notification$/ }, () => ({
            path: "notification",
            namespace: "sidepanel-test",
          }));
          api.onLoad(
            { filter: /^notification$/, namespace: "sidepanel-test" },
            () => ({
              contents:
                "export const createNotification = globalThis.__createNotification;",
              loader: "js",
            }),
          );
        },
      },
    ],
    logLevel: "silent",
  });
  globalThis.__testBrowser = browser;
  const module = await import(`${pathToFileURL(outfile).href}?${Date.now()}`);
  await rm(dir, { recursive: true, force: true });
  return module;
}

function fakeBrowser() {
  const connections = [];
  const removed = [];
  const onConnect = { addListener: (fn) => connections.push(fn) };
  const onRemoved = {
    listeners: [],
    addListener(fn) {
      this.listeners.push(fn);
    },
    removeListener(fn) {
      this.listeners = this.listeners.filter((item) => item !== fn);
    },
  };
  const browser = {
    runtime: {
      id: "test-extension",
      getURL: (path) => `chrome-extension://test-extension/${path}`,
      onConnect,
    },
    windows: {
      onRemoved,
      async getLastFocused() {
        return { id: 7, width: 1000, left: 0, top: 0 };
      },
      async remove(id) {
        removed.push(id);
      },
    },
    __connections: connections,
    __removed: removed,
  };
  return browser;
}

function sidePanelPort() {
  const messages = [];
  const handlers = [];
  const disconnectHandlers = [];
  return {
    name: "wallet_sidepanel",
    sender: {
      id: "test-extension",
      url: "chrome-extension://test-extension/sidepanel.html",
    },
    messages,
    onMessage: { addListener: (fn) => handlers.push(fn) },
    onDisconnect: { addListener: (fn) => disconnectHandlers.push(fn) },
    postMessage(message) {
      messages.push(message);
    },
    disconnect() {
      disconnectHandlers.forEach((fn) => fn());
    },
    ready(windowId = 7) {
      handlers.forEach((fn) => fn({ type: "ready", windowId }));
    },
  };
}

test("side panel confirmation is queued and returns to the previous UI", async () => {
  const browser = fakeBrowser();
  const { ConfirmUI } = await loadConfirmUI(browser);
  const ui = new ConfirmUI(browser, async () => ({ id: 99 }));
  ui.start();
  const port = sidePanelPort();
  browser.__connections.forEach((listener) => listener(port));
  port.ready();
  const writes = [];
  const storage = {
    async setDappRequest(request) {
      writes.push(`set:${request.id}`);
    },
    async removeDappRequest(id) {
      writes.push(`remove:${id}`);
    },
  };
  const request = (id) => ({
    id,
    type: "connect",
    coinType: "ETH",
    siteInfo: {},
    address: "0x0",
    payload: {},
  });
  const first = ui.request(
    "/connect/one",
    request("one"),
    storage,
    async (data) => `approved:${data}`,
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(port.messages[0], {
    type: "confirm-open",
    requestId: "one",
    path: "/connect/one",
  });
  const second = ui.request(
    "/connect/two",
    request("two"),
    storage,
    async (data) => `approved:${data}`,
  );
  ui.finish({ requestId: "one", data: "first" });
  assert.equal(await first, "approved:first");
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(port.messages[2], {
    type: "confirm-open",
    requestId: "two",
    path: "/connect/two",
  });
  ui.finish({ requestId: "two", data: "second" });
  assert.equal(await second, "approved:second");
  assert.deepEqual(writes, ["set:one", "remove:one", "set:two", "remove:two"]);
  assert.deepEqual(
    port.messages
      .filter((message) => message.type === "confirm-done")
      .map((message) => message.requestId),
    ["one", "two"],
  );
});

test("closing a notification confirmation rejects and cleans up", async () => {
  const browser = fakeBrowser();
  const { ConfirmUI } = await loadConfirmUI(browser);
  let opened;
  const ui = new ConfirmUI(browser, async () => (opened = { id: 42 }));
  ui.start();
  const removed = [];
  const storage = {
    async setDappRequest(request) {
      removed.push(`set:${request.id}`);
    },
    async removeDappRequest(id) {
      removed.push(`remove:${id}`);
    },
  };
  const pending = ui.request(
    "/sign_message/one",
    {
      id: "one",
      type: "signMessage",
      coinType: "ETH",
      siteInfo: {},
      address: "0x0",
      payload: {},
    },
    storage,
    async () => true,
  );
  await new Promise((resolve) => setImmediate(resolve));
  browser.__removed.push(opened.id);
  browser.windows.onRemoved.listeners.forEach((listener) =>
    listener(opened.id),
  );
  await assert.rejects(pending, /user cancel/);
  assert.deepEqual(removed, ["set:one", "remove:one"]);
});
