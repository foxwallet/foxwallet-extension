import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
async function bundle(entry, mocks = {}, define = {}) {
  const result = await build({
    entryPoints: [`${root}${entry}`],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "api",
    platform: "browser",
    target: "es2022",
    define: {
      "import.meta.url": '"https://dev.example/offscreen/index.ts"',
      ...define,
    },
    plugins: [
      {
        name: "test-dependencies",
        setup(build) {
          build.onResolve({ filter: /.*/ }, ({ path }) =>
            path in mocks ? { path, namespace: "mock" } : undefined,
          );
          build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => ({
            contents: mocks[path],
            loader: "js",
          }));
        },
      },
    ],
  });
  return result.outputFiles[0].text;
}

const storageBundle = await bundle(
  "core/coins/ALEO/service/scanner/ScannerStorage.ts",
  { localforage: "export default { createInstance: () => globalThis.db }" },
);
function storageHarness(entries = []) {
  const data = new Map(entries);
  let writes = 0;
  const db = {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      writes++;
      data.set(key, value);
      return value;
    },
    async removeItem(key) {
      writes++;
      data.delete(key);
    },
    async clear() {
      data.clear();
    },
    async iterate(fn) {
      for (const [key, value] of data) fn(value, key);
    },
  };
  const context = createContext({ db });
  runInContext(storageBundle, context);
  return {
    storage: context.api.ScannerStorage.getInstance(),
    data,
    writes: () => writes,
  };
}
const entry = (chainId, uuid, address = "address-a") => ({
  chainId,
  uuid,
  address,
});

test("old chain keys remain readable without overwriting concurrent registrations", async () => {
  const h = storageHarness([
    ["scanner_uuid:aleo_mainnet:address-a", entry("aleo_mainnet", "legacy")],
  ]);
  assert.equal(
    await h.storage.getScannerUuid("mainnet", "address-a"),
    "legacy",
  );
  assert.equal(
    await h.storage.getScannerUuid("aleo_mainnet", "address-a"),
    "legacy",
  );
  assert.equal(h.writes(), 0, "reading an old key must not write it back");
  assert.equal(
    (await h.storage.findScannerUuidOwner("legacy")).chainId,
    "mainnet",
  );
  await h.storage.setScannerUuid("aleo_mainnet", "address-a", "new");
  assert.equal(await h.storage.getScannerUuid("mainnet", "address-a"), "new");
  assert.equal(h.data.has("scanner_uuid:aleo_mainnet:address-a"), false);
  assert.equal(await h.storage.findScannerUuidOwner("legacy"), null);
  assert.equal(
    (await h.storage.findScannerUuidOwner("new")).chainId,
    "mainnet",
  );
});

test("clearing a registration removes both aliases without affecting other accounts or networks", async () => {
  const h = storageHarness([
    ["scanner_uuid:aleo_mainnet:address-a", entry("aleo_mainnet", "legacy")],
    ["scanner_uuid:mainnet:address-a", entry("mainnet", "current")],
    ["scanner_uuid:testnet:address-a", entry("testnet", "testnet")],
    ["scanner_uuid:mainnet:address-b", entry("mainnet", "other", "address-b")],
  ]);
  assert.equal(
    await h.storage.getScannerUuid("aleo_mainnet", "address-a"),
    "current",
  );
  await h.storage.findScannerUuidOwner("current");
  await h.storage.clearScannerUuidByUuid("current");
  assert.equal(await h.storage.getScannerUuid("mainnet", "address-a"), null);
  assert.equal(
    await h.storage.getScannerUuid("aleo_mainnet", "address-a"),
    null,
  );
  assert.equal(await h.storage.findScannerUuidOwner("legacy"), null);
  assert.equal(await h.storage.findScannerUuidOwner("current"), null);
  assert.equal(
    await h.storage.getScannerUuid("aleo_testnet", "address-a"),
    "testnet",
  );
  assert.equal(await h.storage.getScannerUuid("mainnet", "address-b"), "other");
});

const clientBundle = await bundle("app/common/utils/client.ts", {
  "./port": "export const Port = globalThis.Port;",
  "./logger": "export const logger = { error() {}, warn() {}, log() {} };",
  nanoid: "let id = 0; export const nanoid = () => String(++id);",
  "../constants": "export const KEEP_ALIVE_INTERVAL = 1000;",
});
function clientHarness() {
  const sent = [],
    ports = [];
  class Port {
    onMessage = {
      addListener: (fn) => {
        this.receive = fn;
      },
    };
    onDisconnect = {
      addListener: (fn) => {
        this.disconnect = fn;
      },
    };
    constructor() {
      ports.push(this);
    }
    postMessage(message) {
      sent.push(message);
    }
  }
  const context = createContext({ Port });
  runInContext(clientBundle, context);
  const client = new context.api.PopupServerClient();
  const reply = (message, data, error = null) =>
    ports.at(-1).receive({
      id: message.id,
      payload: { data, error },
    });
  return { client, sent, ports, reply };
}

test("concurrent balance/status registrations share IPC and release the call after failure or success", async () => {
  const h = clientHarness();
  const first = h.client.scannerRegister({
    chainId: "aleo_mainnet",
    address: "a",
  });
  const second = h.client.scannerRegister({ chainId: "mainnet", address: "a" });
  assert.equal(h.sent.length, 1);
  assert.equal(h.sent[0].payload.chainId, "mainnet");
  const rejected = Promise.all([
    assert.rejects(first, /initialization failed/),
    assert.rejects(second, /initialization failed/),
  ]);
  h.reply(h.sent[0], null, "initialization failed");
  await rejected;
  const retry = h.client.scannerRegister({ chainId: "mainnet", address: "a" });
  assert.equal(h.sent.length, 2);
  h.reply(h.sent[1], { uuid: "registered" });
  assert.equal((await retry).uuid, "registered");
  const later = h.client.scannerRegister({ chainId: "mainnet", address: "a" });
  assert.equal(h.sent.length, 3, "success is not cached forever");
  h.reply(h.sent[2], { uuid: "replacement" });
  assert.equal((await later).uuid, "replacement");
});

test("disconnect rejects a pending registration so reconnect can retry", async () => {
  const h = clientHarness();
  const pending = h.client.scannerRegister({
    chainId: "mainnet",
    address: "a",
  });
  const rejected = assert.rejects(pending, /disconnected/);
  h.ports[0].disconnect();
  await rejected;
  const retry = h.client.scannerRegister({ chainId: "mainnet", address: "a" });
  assert.equal(h.sent.length, 2);
  h.reply(h.sent[1], { uuid: "after-reconnect" });
  assert.equal((await retry).uuid, "after-reconnect");
});

const offscreenBundle = await bundle(
  "offscreen_service/src/index.ts",
  {
    "./worker?worker": "export default globalThis.Worker;",
    "./scannerWorker?worker": "export default globalThis.Worker;",
  },
  { "import.meta.env.DEV": "false" },
);
function offscreenHarness() {
  const workers = [],
    timers = new Map();
  let listener,
    nextTimer = 0;
  class Worker {
    listeners = new Map();
    tasks = [];
    terminated = false;
    constructor() {
      workers.push(this);
    }
    addEventListener(type, fn) {
      this.listeners.set(type, fn);
    }
    removeEventListener(type) {
      this.listeners.delete(type);
    }
    postMessage(task) {
      this.tasks.push(task);
    }
    terminate() {
      this.terminated = true;
    }
    emit(type, event) {
      this.listeners.get(type)?.(event);
    }
  }
  const context = createContext({
    Worker,
    URL,
    console: { log() {}, warn() {}, debug() {} },
    setTimeout(fn, ms) {
      const id = ++nextTimer;
      timers.set(id, { fn, ms });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    chrome: {
      runtime: {
        onMessage: {
          addListener(fn) {
            listener = fn;
          },
        },
      },
    },
  });
  runInContext(offscreenBundle, context);
  const request = () =>
    new Promise((resolve) =>
      listener(
        {
          type: "scanner_encrypt_registration",
          origin: "background_to_offscreen_scanner",
          payload: { viewKey: "synthetic", publicKey: "synthetic", start: 0 },
        },
        {},
        resolve,
      ),
    );
  return { workers, timers, request };
}

test("worker startup failure is returned immediately, and retry waits for a fresh worker", async () => {
  const h = offscreenHarness();
  const pending = h.request();
  h.workers[0].emit("error", { message: "WASM module load failed" });
  assert.equal((await pending).payload.error, "WASM module load failed");
  assert.equal(
    h.workers[0].tasks.length,
    0,
    "never post a task to a failed worker",
  );
  assert.equal(h.workers[0].terminated, true);
  assert.equal(h.timers.size, 0);
  const retry = h.request();
  const worker = h.workers[1];
  assert.equal(worker.tasks.length, 0, "registration must wait for readiness");
  worker.emit("message", { data: { type: "ready" } });
  await new Promise(setImmediate);
  assert.equal(worker.tasks.length, 1);
  worker.emit("message", {
    data: {
      id: worker.tasks[0].id,
      error: null,
      data: { ciphertext: "encrypted" },
    },
  });
  assert.equal((await retry).payload.data.ciphertext, "encrypted");
  assert.equal(h.timers.size, 0);
});

test("a timed-out encryption terminates the worker and permits a fresh retry", async () => {
  const h = offscreenHarness();
  const pending = h.request();
  h.workers[0].emit("message", { data: { type: "ready" } });
  await new Promise(setImmediate);
  const timeout = [...h.timers.values()].find((timer) => timer.ms === 30000);
  assert.ok(timeout);
  timeout.fn();
  assert.equal((await pending).payload.error, "scanner worker timed out");
  assert.equal(h.workers[0].terminated, true);
  const retry = h.request();
  assert.equal(h.workers.length, 2);
  h.workers[1].emit("error", { message: "retry startup failed" });
  assert.equal((await retry).payload.error, "retry startup failed");
});
