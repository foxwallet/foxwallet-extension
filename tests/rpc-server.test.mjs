import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    contents:
      "export { default as RPCServer } from './app/scripts/background/servers/RPCServer';",
    resolveDir: root,
    loader: "ts",
  },
  tsconfig: `${root}tsconfig.json`,
  bundle: true,
  write: false,
  format: "iife",
  globalName: "api",
  platform: "browser",
  target: "es2022",
});

const urls = [
  "https://first.example/rpc",
  "https://second.example/rpc",
  "https://third.example/rpc",
];
const payload = {
  jsonrpc: "2.0",
  id: "balance-1",
  method: "eth_getBalance",
  params: ["0x50ba59196c614b68b4810f2801c4d9ca9ab7c669", "latest"],
};
const result = (value = "0x0", id = payload.id) => ({
  jsonrpc: "2.0",
  id,
  result: value,
});
const reply = (json = result(), status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => json,
});

function harness(fetch) {
  const calls = [];
  const context = createContext({
    AbortController,
    URL,
    setTimeout,
    clearTimeout,
    fetch: (url, options) => {
      calls.push({ url, options });
      return fetch(url, options);
    },
  });
  runInContext(bundle.outputFiles[0].text, context);
  return { RPCServer: context.api.RPCServer, calls };
}

test("a new per-request server prioritizes the last successful node", async () => {
  const h = harness(async (url) => {
    if (url === urls[0]) throw new Error("offline");
    return reply();
  });
  const beforeSuccess = new h.RPCServer(urls);
  await new h.RPCServer(urls).call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    urls.slice(0, 2),
  );
  h.calls.length = 0;
  await new h.RPCServer(urls).call(payload);
  await beforeSuccess.call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    [urls[1], urls[1]],
  );
  assert.equal(h.calls[0].options.body, JSON.stringify(payload));
});

test("preference is isolated by configured list and does not mutate configs", async () => {
  const h = harness(async (url) => {
    if (url === urls[0]) throw new Error("offline");
    return reply();
  });
  const configured = [...urls];
  await new h.RPCServer(configured).call(payload);
  assert.deepEqual(configured, urls);
  h.calls.length = 0;
  await new h.RPCServer([urls[0], urls[2]]).call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    [urls[0], urls[2]],
  );
});

test("a failed preferred node switches and its replacement becomes preferred", async () => {
  let working = urls[1];
  const h = harness(async (url) => {
    if (url !== working) throw new Error("offline");
    return reply();
  });
  await new h.RPCServer(urls).call(payload);
  h.calls.length = 0;
  working = urls[2];
  await new h.RPCServer(urls).call(payload);
  await new h.RPCServer(urls).call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    [urls[1], urls[2], urls[2]],
  );
});

test(
  "timeout aborts a stalled node, including a stalled response body",
  { timeout: 2000 },
  async () => {
    for (const bodyStalled of [false, true]) {
      const h = harness(async (url) => {
        if (url === urls[0]) {
          if (bodyStalled)
            return { ok: true, status: 200, json: () => new Promise(() => {}) };
          return new Promise(() => {});
        }
        return reply();
      });
      const response = await new h.RPCServer(urls, { timeoutMs: 20 }).call(
        payload,
      );
      assert.equal(response.result, "0x0");
      assert.equal(h.calls[0].options.signal.aborted, true);
      h.calls.length = 0;
      await new h.RPCServer(urls).call(payload);
      assert.deepEqual(
        h.calls.map(({ url }) => url),
        [urls[1]],
      );
    }
  },
);

test("late success from an older call cannot replace a newer successful node", async () => {
  let release;
  let first = true;
  const h = harness(async (url) => {
    if (url === urls[0]) {
      if (first) {
        first = false;
        return new Promise((resolve) => {
          release = () => resolve(reply());
        });
      }
      throw new Error("offline");
    }
    return reply();
  });
  const oldCall = new h.RPCServer(urls).call(payload);
  await new h.RPCServer(urls).call(payload);
  release();
  await oldCall;
  h.calls.length = 0;
  await new h.RPCServer(urls).call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    [urls[1]],
  );
});

test("HTTP errors, RPC errors, malformed JSON and mismatched IDs never win", async () => {
  const badResponses = [
    reply(result(), 503),
    reply({
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32000, message: "type error" },
    }),
    {
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Bad JSON");
      },
    },
    reply({ jsonrpc: "2.0", id: payload.id }),
    reply(result("0x1", "wrong-id")),
    reply(null),
  ];
  for (const bad of badResponses) {
    const h = harness(async (url) => (url === urls[0] ? bad : reply()));
    await new h.RPCServer(urls).call(payload);
    h.calls.length = 0;
    await new h.RPCServer(urls).call(payload);
    assert.deepEqual(
      h.calls.map(({ url }) => url),
      [urls[1]],
    );
  }
});

test("valid falsy JSON-RPC results are successful", async () => {
  for (const value of [null, false, 0, "0x0"]) {
    const h = harness(async (url) => {
      if (url === urls[0]) throw new Error("offline");
      return reply(result(value));
    });
    const response = await new h.RPCServer(urls).call(payload);
    assert.equal(response.result, value);
    assert.equal(new h.RPCServer(urls).currentRpcIndex, 1);
  }
});

test("tries every distinct node once, including lists longer than three", async () => {
  const fourth = "https://fourth.example/rpc";
  const h = harness(async (url) => {
    if (url !== fourth) throw new Error("offline");
    return reply();
  });
  await new h.RPCServer([...urls, urls[0], fourth]).call(payload);
  assert.deepEqual(
    h.calls.map(({ url }) => url),
    [...urls, fourth],
  );
  assert.throws(() => new h.RPCServer([]), /No RPC URLs configured/);
});

test("all failed endpoints reject with a useful error and preserve RPC error codes", async () => {
  const h = harness(async () =>
    reply({
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32000, message: "type error" },
    }),
  );
  await assert.rejects(
    new h.RPCServer(urls).call(payload),
    (error) => error.code === -32000 && error.message === "type error",
  );
  assert.equal(h.calls.length, urls.length);
  const offline = harness(async () => {
    throw new Error("offline");
  });
  await assert.rejects(
    new offline.RPCServer(urls).call(payload),
    /All 3 RPC URLs failed: .*offline/,
  );
});

test("preserves the first provider error when later endpoints fail differently", async () => {
  const h = harness(async (url) => {
    if (url === urls[0]) {
      return reply({
        jsonrpc: "2.0",
        id: payload.id,
        error: { code: -32001, message: "rejected by node" },
      });
    }
    throw new Error("offline");
  });
  await assert.rejects(
    new h.RPCServer(urls).call(payload),
    (error) => error.code === -32001 && error.message === "rejected by node",
  );
  assert.equal(h.calls.length, urls.length);
});

test("does not retry provider errors for non-idempotent transaction methods", async () => {
  const transactionPayload = {
    ...payload,
    method: "eth_sendRawTransaction",
    params: ["0xdeadbeef"],
  };
  const h = harness(async () =>
    reply({
      jsonrpc: "2.0",
      id: transactionPayload.id,
      error: { code: -32003, message: "insufficient funds" },
    }),
  );
  await assert.rejects(
    new h.RPCServer(urls).call(transactionPayload),
    (error) => error.code === -32003 && error.message === "insufficient funds",
  );
  assert.equal(h.calls.length, 1);
});
