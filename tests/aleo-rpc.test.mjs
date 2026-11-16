import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const latest = [
  [
    "getLatestBlock",
    "/block/latest",
    "/latest/block",
    { block_hash: "ab1test" },
  ],
  ["getLatestHash", "/block/hash/latest", "/latest/hash", "ab1test"],
  ["getLatestHeight", "/block/height/latest", "/latest/height", 23800000],
  ["getStateRoot", "/stateRoot/latest", "/latest/stateRoot", "sr1test"],
];

for (const entry of [
  "core/coins/ALEO/service/api/rpc.ts",
  "offscreen_service/src/api/rpc.ts",
]) {
  const result = await build({
    entryPoints: [root + entry],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "api",
    platform: "browser",
    plugins: [
      {
        name: "fetch-only-request",
        setup(build) {
          build.onResolve({ filter: /^@\/common\/utils\/request$/ }, () => ({
            path: "request",
            namespace: "mock",
          }));
          build.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents:
              "export const get = (...args) => fetch(...args); export const post = (...args) => fetch(...args);",
            loader: "js",
          }));
        },
      },
    ],
  });

  test(`${entry} supports official v2 and legacy nodes after switching hosts`, async () => {
    const requests = [];
    const context = createContext({
      fetch: async (url) => {
        requests.push(url);
        const path = new URL(url).pathname.replace(/^.*\/mainnet/, "");
        const route = latest.find(([, v2, legacy]) =>
          url.startsWith("https://api.provable.com/v2/")
            ? path === v2
            : path === legacy,
        );
        return new Response(
          JSON.stringify(route?.[3] ?? { error: "Not Found" }),
          {
            status: route ? 200 : 404,
          },
        );
      },
    });
    runInContext(result.outputFiles[0].text, context);
    const rpc = new context.api.AleoRpc(
      "https://api.provable.com/v2",
      "mainnet",
    );

    for (const host of [
      "https://api.provable.com/v2",
      "https://custom.example/aleo",
      "https://api.provable.com/v1",
      "https://api.provable.com/v2",
    ]) {
      rpc.setHost(host);
      for (const [method, v2, legacy, expected] of latest) {
        assert.deepEqual(
          JSON.parse(JSON.stringify(await rpc[method]())),
          expected,
        );
        assert.equal(
          requests.at(-1),
          `${host}/mainnet${host.endsWith("/v2") ? v2 : legacy}`,
        );
      }
    }
  });
}
