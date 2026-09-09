import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const requestEvent = "@webext-core/messaging/custom-events";
const responseEvent = `${requestEvent}/response`;
const namespace = (coin) => `foxwallet:injector-to-content:v1:${coin}`;
const plain = (value) => JSON.parse(JSON.stringify(value));
const flush = () => new Promise((resolve) => setImmediate(resolve));
const sender = {
  id: "foxwallet-test",
  origin: "https://frame.example:8443",
  url: "https://frame.example:8443/app",
  tab: { id: 7, url: "https://top.example/" },
};

async function bundle(contents) {
  const result = await build({
    stdin: { contents, resolveDir: root, loader: "ts" },
    bundle: true,
    write: false,
    format: "iife",
    globalName: "api",
    platform: "browser",
    target: "es2022",
    tsconfig: `${root}tsconfig.json`,
    plugins: [
      {
        name: "browser-and-wallet-boundaries",
        setup(build) {
          build.onResolve({ filter: /^webextension-polyfill$/ }, () => ({
            path: "browser",
            namespace: "fixture",
          }));
          build.onResolve(
            {
              filter: /\/(ALEOContentServer|ETHContentSever|QTUMContentSever)$/,
            },
            () => ({
              path: "wallet",
              namespace: "fixture",
            }),
          );
          build.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            contents:
              path === "browser"
                ? "export default globalThis.browser;"
                : "export class ALEOContentWalletServer {}; export class ETHContentWalletServer {}; export class QTUMContentWalletServer {};",
          }));
        },
      },
    ],
  });
  return result.outputFiles[0].text;
}

// Real messaging library and application transport in independent JS worlds.
// Only browser APIs and the actual wallet operations are replaced.
const [pageCode, contentCode, backgroundCode] = await Promise.all([
  bundle(`
    export { BaseProvider } from './app/scripts/content/BaseProvider';
    export { AleoProvider } from './app/scripts/content/AleoProvider';
    export { FoxWeb3Provider } from './app/scripts/content/EthProvider';
    export { QtumProvider } from './app/scripts/content/QtumProvider';
    export { getWebsiteMessenger } from './app/messaging/injectorToContent';
  `),
  bundle(`
    export { ContentBridge } from './app/scripts/content/ContentBridge';
    export { ContentClient } from './app/scripts/content/ContentClient';
  `),
  bundle(`
    export { ContentServerHandler } from './app/scripts/background/handlers/ContentServerHandler';
    export { ContentWalletServer } from './app/scripts/background/servers/ContentServer';
    export { bindSiteMetadataToSender } from './app/scripts/background/helper/contentOrigin';
    export { ProviderError } from './app/scripts/content/ErrorCode';
    export { getEthBalance } from './app/scripts/background/helper/ethGetBalance';
  `),
]);

function listeners() {
  const callbacks = new Set();
  return {
    addListener: (callback) => callbacks.add(callback),
    fire: (...args) => {
      for (const callback of callbacks) callback(...args);
    },
  };
}

function createHarness(execute = async (request) => request, source = sender) {
  const eventListeners = new Map();
  const calls = [];
  const ports = [];
  const document = {
    title: "Example dApp",
    querySelector: () => null,
    querySelectorAll: () => [{ href: "https://frame.example/icon.png" }],
  };
  const window = {
    location: new URL(sender.url),
    document,
    addEventListener(type, callback) {
      if (!eventListeners.has(type)) eventListeners.set(type, new Set());
      eventListeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      eventListeners.get(type)?.delete(callback);
    },
    dispatchEvent(event) {
      for (const callback of [...(eventListeners.get(event.type) ?? [])])
        callback(event);
      return true;
    },
  };
  const browser = { runtime: { id: sender.id, connect } };
  function world(code, withBrowser) {
    const isolatedWindow = { ...window };
    const context = createContext({
      window: isolatedWindow,
      document,
      location: isolatedWindow.location,
      browser: withBrowser ? browser : undefined,
      crypto: webcrypto,
      structuredClone,
      URL,
      TextEncoder,
      TextDecoder,
      atob,
      btoa,
      setTimeout,
      clearTimeout,
      console: { log() {}, warn() {}, error() {}, debug() {} },
      CustomEvent: class {
        constructor(type, { detail }) {
          this.type = type;
          this.detail = detail;
        }
      },
    });
    runInContext(code, context);
    return context.api;
  }
  const background = world(backgroundCode, true);
  const handler = new background.ContentServerHandler({
    execute(request) {
      calls.push(request);
      return execute(request);
    },
  });
  function connect({ name }) {
    let closed = false;
    const client = { name, onMessage: listeners(), onDisconnect: listeners() };
    const server = {
      name,
      sender: source,
      onMessage: listeners(),
      onDisconnect: listeners(),
    };
    for (const [from, to] of [
      [client, server],
      [server, client],
    ]) {
      from.postMessage = (message) => {
        if (closed) throw new Error("Port disconnected");
        // Chrome runtime messaging uses JSON serialization, not structured clone.
        const wire = plain(message);
        queueMicrotask(() => {
          if (!closed) to.onMessage.fire(wire);
        });
      };
      from.disconnect = () => {
        if (closed) return;
        closed = true;
        server.onDisconnect.fire(server);
        client.onDisconnect.fire(client);
      };
    }
    ports.push({ client, server });
    handler.handle(server);
    return client;
  }
  const content = world(contentCode, true);
  const client = new content.ContentClient((data) => bridge.emit(data));
  const bridge = new content.ContentBridge(client);
  const page = world(pageCode, false);
  return {
    page,
    background,
    handler,
    client,
    calls,
    ports,
    window,
    eventListeners,
  };
}

function rawRequest(h, coinType, method, data) {
  const message = { id: 500, type: method, timestamp: Date.now(), data };
  return new Promise((resolve) => {
    const listener = ({ detail }) => {
      if (
        detail.namespace === namespace(coinType) &&
        detail.message.id === message.id
      ) {
        h.window.removeEventListener(responseEvent, listener);
        resolve(detail.response);
      }
    };
    h.window.addEventListener(responseEvent, listener);
    h.window.dispatchEvent({
      type: requestEvent,
      detail: {
        message,
        namespace: namespace(coinType),
        instanceId: "untrusted-page",
      },
    });
  });
}

test(
  "concurrent calls of the same method keep their IDs when replies arrive backwards",
  { timeout: 3000 },
  async () => {
    const pending = [];
    const h = createHarness(
      (request) => new Promise((resolve) => pending.push({ request, resolve })),
    );
    const eth = new h.page.BaseProvider("ETH");
    const first = eth.send("personal_sign", { message: "first" });
    const second = eth.send("personal_sign", { message: "second" });
    await flush();
    assert.equal(pending.length, 2);
    pending[1].resolve("second-signature");
    pending[0].resolve("first-signature");
    assert.deepEqual(await Promise.all([first, second]), [
      "first-signature",
      "second-signature",
    ]);
    assert.equal(h.eventListeners.get(responseEvent).size, 0);
  },
);

test(
  "raw page requests preserve payload and state, but cannot supply trusted site identity",
  { timeout: 3000 },
  async () => {
    const h = createHarness();
    const payload = { transaction: { inputs: ["1u64"], fee: 10 } };
    const response = await rawRequest(h, "ALEO", "requestTransaction", {
      payload,
      coinType: "ETH",
      method: "exportPrivateKey",
      metadata: {
        network: "mainnet",
        address: "aleo1example",
        siteInfo: {
          origin: "https://trusted.example",
          name: "forged",
          icon: "forged",
        },
      },
    });
    assert.equal(response.res.error, null);
    const [request] = h.calls;
    assert.equal(request.coinType, "ALEO");
    assert.equal(request.method, "requestTransaction");
    assert.deepEqual(plain(request.payload), payload);
    assert.deepEqual(plain(request.siteMetadata), {
      siteInfo: {
        origin: sender.origin,
        name: "Example dApp",
        icon: "https://frame.example/icon.png",
      },
      network: "mainnet",
      address: "aleo1example",
    });
  },
);

test(
  "legacy page events and unregistered page methods do not reach the wallet",
  { timeout: 3000 },
  async () => {
    const h = createHarness();
    h.window.dispatchEvent({
      type: "fox_dapp_request",
      detail: { method: "personal_sign" },
    });
    await rawRequest(h, "ETH", "exportPrivateKey", { payload: {} });
    await rawRequest(h, "ETH", "requestTransaction", { payload: {} });
    const malformed = await rawRequest(h, "ALEO", "connect", null);
    assert.match(malformed.err.message, /Invalid dApp request/);
    const eth = new h.page.BaseProvider("ETH");
    for (const method of [
      "constructor",
      "__proto__",
      "toString",
      "exportPrivateKey",
      "connect",
    ]) {
      await assert.rejects(
        eth.send(method, {}),
        (error) => error.code === 4200,
      );
    }
    assert.equal(h.calls.length, 0);
  },
);

test("background authenticates the sending frame, with no fallback from opaque origins to tab URL", () => {
  const h = createHarness();
  const bind = h.background.bindSiteMetadataToSender;
  const metadata = {
    siteInfo: { origin: "https://forged.example", name: "dApp", icon: null },
  };
  assert.equal(
    bind(metadata, sender, sender.id).siteInfo.origin,
    sender.origin,
  );
  assert.equal(
    bind(metadata, { ...sender, origin: undefined }, sender.id).siteInfo.origin,
    sender.origin,
  );
  for (const source of [
    undefined,
    { ...sender, id: "other-extension" },
    { ...sender, tab: undefined },
    { ...sender, origin: "null" },
    { ...sender, origin: "" },
    { ...sender, origin: "file:///tmp/test" },
    { ...sender, origin: "data:text/html,hello" },
    { ...sender, origin: undefined, url: undefined },
  ]) {
    assert.throws(() => bind(metadata, source, sender.id));
  }
});

test(
  "background rejects internal methods and invalid senders even over a runtime port",
  { timeout: 3000 },
  async () => {
    for (const [coinType, method, source] of [
      ["ETH", "constructor", sender],
      ["ETH", "__proto__", sender],
      ["ETH", "toString", sender],
      ["ETH", "getChainServer", sender],
      ["ETH", "requestTransaction", sender],
      ["INVALID", "eth_accounts", sender],
      ["ETH", "eth_accounts", { ...sender, origin: "null" }],
      ["ETH", "eth_accounts", { ...sender, id: "other-extension" }],
    ]) {
      const h = createHarness(undefined, source);
      const result = await h.client.send(method, {}, coinType, {
        siteInfo: { origin: "https://forged.example" },
      });
      assert.ok(result.error?.message);
      assert.equal(h.calls.length, 0);
    }
  },
);

test("wallet dispatcher independently rejects prototype and private methods", async () => {
  const h = createHarness();
  const wallet = Object.create(h.background.ContentWalletServer.prototype);
  let calls = 0;
  wallet.ethServer = {
    eth_accounts: async () => {
      calls++;
      return [];
    },
  };
  for (const method of [
    "constructor",
    "__proto__",
    "toString",
    "getChainServer",
    "requestTransaction",
  ]) {
    await assert.rejects(
      wallet.execute({ method, coinType: "ETH" }),
      /Unsupported dApp method/,
    );
  }
  assert.deepEqual(
    await wallet.execute({ method: "eth_accounts", coinType: "ETH" }),
    [],
  );
  assert.equal(calls, 1);
});

test(
  "chain namespaces isolate requests and background notifications",
  { timeout: 3000 },
  async () => {
    const h = createHarness(async ({ coinType }) => coinType);
    const providers = ["ETH", "QTUM", "ALEO"].map(
      (coin) => new h.page.BaseProvider(coin),
    );
    const events = [];
    providers.forEach((provider) => {
      provider.onDappEmit = ({ detail }) => events.push(detail);
    });
    assert.deepEqual(
      await Promise.all([
        providers[0].send("personal_sign", {}),
        providers[1].send("personal_sign", {}),
        providers[2].send("signMessage", {}),
      ]),
      ["ETH", "QTUM", "ALEO"],
    );
    const notification = {
      type: "EmitData",
      coinType: "QTUM",
      event: "accountsChanged",
      data: ["Qtest"],
    };
    h.handler.emitToDapps(notification);
    await flush();
    assert.deepEqual(plain(events), [notification]);
  },
);

test(
  "provider errors retain their code and message through both transports",
  { timeout: 3000 },
  async () => {
    const h = createHarness(async () => {
      throw new h.background.ProviderError(4001, "User rejected request");
    });
    const provider = new h.page.BaseProvider("ETH");
    await assert.rejects(provider.send("personal_sign", {}), (error) => {
      assert.equal(error.code, 4001);
      assert.equal(error.message, "User rejected request");
      return true;
    });
  },
);

test(
  "disconnect rejects pending requests and only removes the disconnected port",
  { timeout: 3000 },
  async () => {
    let pending = true;
    const h = createHarness(async () =>
      pending ? new Promise(() => {}) : "reconnected",
    );
    const provider = new h.page.BaseProvider("ETH");
    const rejection = assert.rejects(
      provider.send("personal_sign", {}),
      /ContentClient disconnected/,
    );
    await flush();
    const other = {
      name: "content_to_background",
      onMessage: listeners(),
      onDisconnect: listeners(),
    };
    h.handler.handle(other);
    h.ports[0].client.disconnect();
    await rejection;
    assert.equal(h.handler.pagePorts.includes(h.ports[0].server), false);
    assert.equal(h.handler.pagePorts.includes(other), true);
    assert.equal(h.handler.pagePorts.includes(h.ports[1].server), true);
    pending = false;
    assert.equal(await provider.send("personal_sign", {}), "reconnected");
  },
);

test(
  "public Aleo, Ethereum and Qtum provider APIs still use the migrated bridge",
  { timeout: 3000 },
  async () => {
    const h = createHarness(async ({ method, coinType, payload }) => {
      if (method === "_getGlobalChainId")
        return coinType === "QTUM" ? "0x51" : "0x1";
      if (method === "_setGlobalChainId") return payload;
      if (method === "connect") return "aleo1connected";
      if (method === "requestRecords") return [{ id: "record-1" }];
      if (method === "eth_accounts")
        return coinType === "QTUM" ? [{ evmAddress: "0xqtum" }] : ["0xeth"];
      throw new Error(`Unexpected test wallet method: ${method}`);
    });
    const aleo = new h.page.AleoProvider();
    const eth = new h.page.FoxWeb3Provider();
    const qtum = new h.page.QtumProvider();
    assert.equal(
      await aleo.connect("NO_DECRYPT", "mainnetbeta", ["credits.aleo"]),
      true,
    );
    assert.deepEqual(plain(await aleo.requestRecords("credits.aleo")), [
      { id: "record-1" },
    ]);
    assert.deepEqual(
      plain(await eth.request({ method: "eth_accounts", params: [] })),
      ["0xeth"],
    );
    assert.deepEqual(
      plain(await qtum.request({ method: "eth_accounts", params: [] })),
      ["0xqtum"],
    );
    assert.equal(aleo.publicKey, "aleo1connected");
    const recordCall = h.calls.find(
      ({ method }) => method === "requestRecords",
    );
    assert.equal(recordCall.siteMetadata.address, "aleo1connected");
    assert.equal(recordCall.siteMetadata.network, "mainnet");
    await flush();
  },
);

test("eth_getBalance validates the address, defaults to latest, and normalizes quantities", async () => {
  const { getEthBalance } = createHarness().background;
  const requests = [];
  const call = async (request) => {
    requests.push(request);
    return { result: "0x000de0b6b3a7640000" };
  };
  assert.equal(
    await getEthBalance(
      {
        id: "balance-1",
        method: "eth_getBalance",
        params: ["0x1111111111111111111111111111111111111111"],
      },
      call,
    ),
    "0xde0b6b3a7640000",
  );
  assert.deepEqual(plain(requests[0].params), [
    "0x1111111111111111111111111111111111111111",
    "latest",
  ]);
  await assert.rejects(
    getEthBalance({ method: "eth_getBalance", params: ["0x1234"] }, call),
    (error) => error.code === -32602,
  );
  assert.equal(requests.length, 1);
  await assert.rejects(
    getEthBalance(
      {
        method: "eth_getBalance",
        params: ["0x1111111111111111111111111111111111111111"],
      },
      async () => ({ result: "not-a-quantity" }),
    ),
    (error) => error.code === -32603,
  );
});

test(
  "ETH and Qtum balance requests preserve their network and block selectors without connecting",
  { timeout: 3000 },
  async () => {
    const networks = { ETH: "0x89", QTUM: "0x22b9" };
    const rpcCalls = [];
    const h = createHarness(
      async ({ method, coinType, payload, siteMetadata }) => {
        if (method === "_getGlobalChainId") return networks[coinType];
        if (method === "_setGlobalChainId") return payload;
        assert.equal(method, "eth_getBalance");
        return h.background.getEthBalance(payload, async (request) => {
          rpcCalls.push({
            coinType,
            network: siteMetadata.network,
            request: plain(request),
          });
          return {
            result: coinType === "ETH" ? "0x10000000000000001" : "0x00",
          };
        });
      },
    );
    const eth = new h.page.FoxWeb3Provider();
    const qtum = new h.page.QtumProvider();
    await flush();
    const address = "0x1111111111111111111111111111111111111111";
    for (const selector of [
      "pending",
      "0x123",
      { blockHash: `0x${"ab".repeat(32)}`, requireCanonical: true },
    ]) {
      const request = Object.freeze({
        method: "eth_getBalance",
        params: [address, selector],
      });
      assert.deepEqual(
        await Promise.all([eth.request(request), qtum.request(request)]),
        ["0x10000000000000001", "0x0"],
      );
      for (const { coinType, network, request: rpc } of rpcCalls.slice(-2)) {
        assert.equal(network, networks[coinType]);
        assert.equal(rpc.jsonrpc, "2.0");
        assert.equal(rpc.method, "eth_getBalance");
        assert.deepEqual(rpc.params, [address, selector]);
      }
    }
    const legacy = await new Promise((resolve, reject) => {
      qtum.sendAsync(
        { id: "balance-2", method: "eth_getBalance", params: [address] },
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        },
      );
    });
    assert.deepEqual(plain(legacy), {
      id: "balance-2",
      jsonrpc: "2.0",
      result: "0x0",
    });
    assert.equal(
      h.calls.some(
        ({ method }) =>
          method === "eth_accounts" || method === "eth_requestAccounts",
      ),
      false,
    );
  },
);
