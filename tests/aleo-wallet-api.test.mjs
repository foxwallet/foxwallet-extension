import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { build } from "esbuild";

async function bundle(entry, mocks) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "api",
    platform: "browser",
    plugins: [
      {
        name: "mocks",
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
const walletBundle = await bundle("core/coins/ALEO/service/api/api.ts", {
  "@/common/utils/request": "export const get = (...args) => fetch(...args)",
});
const historyBundle = await bundle("core/coins/ALEO/service/api/provable.ts", {
  "@/common/utils/request": "export const get = (...args) => fetch(...args)",
});
const recordBundle = await bundle(
  "core/coins/ALEO/service/scanner/recordAdapter.ts",
  {},
);
const feeBundle = await bundle(
  "core/coins/ALEO/service/fee/AleoFeeService.ts",
  {
    "./client":
      "export const estimateFeeInWorker = () => { throw Error('unexpected worker'); }",
  },
);
function walletHarness(status, body) {
  const urls = [];
  const context = createContext({
    fetch: async (url) => {
      urls.push(url);
      return new Response(JSON.stringify(body), { status });
    },
  });
  runInContext(walletBundle, context);
  return { Api: context.api.AleoWalletApi, urls };
}
const tx = (status = "Accepted") => ({
  id: "at1test",
  status,
  block_height: 123,
  block_timestamp: "1794800000",
  execution: { transitions: [] },
});

test("official Explorer transaction statuses and timestamps adapt to wallet consumers", async () => {
  for (const [wire, expected] of [
    ["Accepted", "accepted"],
    ["Confirmed", "accepted"],
    ["Rejected", "rejected"],
    ["Pending", -1],
    ["Unconfirmed", -1],
  ]) {
    const { Api, urls } = walletHarness(200, tx(wire));
    const api = new Api({
      host: "https://api.provable.com/v2",
      chainId: "mainnet",
    });
    const result = await api.getTransaction("at1test");
    assert.equal(result.status, expected);
    assert.equal(result.height, expected === -1 ? 0 : 123);
    assert.equal(result.timestamp, expected === -1 ? 0 : 1794800000000);
    assert.equal(
      urls[0],
      "https://api.provable.com/v2/mainnet/transactions/at1test",
    );
    assert.equal(result.origin_data.id, "at1test");
  }
});
test("old environment artifacts use official Explorer without contacting Fox", async () => {
  for (let i = 1; i <= 5; i++) {
    const { Api, urls } = walletHarness(200, tx());
    await new Api({
      host: `https://aleo${i}-web3.foxnb.net/proxy/extension/v1/aleo`,
      chainId: "mainnet",
    }).getTransaction("at1test");
    assert.equal(
      urls[0],
      "https://api.provable.com/v2/mainnet/transactions/at1test",
    );
  }
});
test("transaction requests trim whitespace before encoding and validating the response ID", async () => {
  const transactionId =
    "at1dnanzfe20p6sasx0nu3x5fal5277vw2rf99ef3j9pkdhg9jhnqrsq8gzwu";
  for (const id of [transactionId + "    ", " \t" + transactionId + "\r\n"]) {
    const { Api, urls } = walletHarness(200, { ...tx(), id: transactionId });
    const api = new Api({
      host: "https://api.provable.com/v2",
      chainId: "mainnet",
    });
    const result = await api.getTransaction(id);
    assert.equal(
      urls[0],
      `https://api.provable.com/v2/mainnet/transactions/${transactionId}`,
    );
    assert.equal(result.origin_data.id, transactionId);
    assert.equal(result.status, "accepted");
  }
});
test("blank transaction IDs fail before making a request", async () => {
  const { Api, urls } = walletHarness(200, tx());
  const api = new Api({
    host: "https://api.provable.com/v2",
    chainId: "mainnet",
  });
  for (const id of ["", " \t\r\n "]) {
    await assert.rejects(api.getTransaction(id), /Missing Aleo transaction ID/);
  }
  assert.equal(urls.length, 0);
});
test("scanner records and public history expose transaction IDs without padding", async () => {
  const context = createContext({});
  runInContext(recordBundle, context);
  const record = context.api.ownedToRecordDetail({
    commitment: "1field",
    programName: "credits.aleo",
    tag: "2field",
    recordPlaintext: "{ microcredits: 1u64.private }",
    transactionId: " at1test    ",
  });
  assert.equal(record.transactionId, "at1test");
  const legacy = context.api.ownedToRecordDetail({
    commitment: "1field",
    programName: "credits.aleo",
    tag: "2field",
    recordPlaintext: "{}",
  });
  assert.equal(legacy.transactionId, "");
  const historyContext = createContext({
    URLSearchParams,
    fetch: async () =>
      new Response(
        JSON.stringify({
          address: "aleo1test",
          transactions: [
            {
              transaction_id: "\tat1test    ",
              transition_id: "au1test",
              transaction_status: "Accepted",
              block_number: 123,
              block_timestamp: "1794800000",
              function_id: "transfer_public",
              program_id: "credits.aleo",
            },
          ],
        }),
      ),
  });
  runInContext(historyBundle, historyContext);
  const history = await new historyContext.api.ProvableApi().getTransferHistory(
    { network: "mainnet", address: "aleo1test" },
  );
  assert.equal(history.transactions[0].transactionId, "at1test");
});
test("missing transactions stay unconfirmed; HTTP failures and invalid metadata propagate", async () => {
  const { Api } = walletHarness(404, {});
  assert.equal(
    await new Api({
      host: "https://api.provable.com/v2",
      chainId: "mainnet",
    }).getTransaction("at1test"),
    undefined,
  );
  for (const [status, body] of [
    [500, {}],
    [200, tx("Unknown")],
    [200, { ...tx(), id: "wrong" }],
    [200, { ...tx(), block_height: null }],
    [200, { ...tx(), block_timestamp: null }],
  ]) {
    const { Api } = walletHarness(status, body);
    await assert.rejects(
      new Api({
        host: "https://api.provable.com/v2",
        chainId: "mainnet",
      }).getTransaction("at1test"),
    );
  }
});
function feeHarness(rpc, estimator) {
  let now = 0;
  const context = createContext({ Date: { now: () => now } });
  runInContext(feeBundle, context);
  return {
    service: new context.api.AleoFeeService(rpc, "mainnet", estimator),
    read: context.api.readPriorityFee,
    advance: (ms) => {
      now += ms;
    },
  };
}
function confirmed(kind, priority = "0u64", status = "accepted") {
  return {
    status,
    transaction: {
      fee: {
        transition: {
          program: "credits.aleo",
          function: kind,
          inputs: (kind === "fee_private"
            ? ["record", "999999u64", priority]
            : ["999999u64", priority]
          ).map((value) => ({ value })),
        },
      },
    },
  };
}
test("priority samples distinguish public/private fees and retain valid zero", () => {
  const { read } = feeHarness({});
  assert.equal(read(confirmed("fee_public")), 0n);
  assert.equal(read(confirmed("fee_private", "12u64")), 12n);
  for (const row of [
    confirmed("unknown"),
    confirmed("fee_public", "-1u64"),
    confirmed("fee_private", "18446744073709551616u64"),
    confirmed("fee_public", "1u64", "rejected"),
  ])
    assert.equal(read(row), undefined);
});
test("priority fee samples ten blocks, uses P75, coalesces and caches requests", async () => {
  let calls = 0;
  const { service, advance } = feeHarness({
    getLatestHeight: async () => 100,
    getBlockRange: async (start, end) => {
      calls++;
      assert.equal(start, 91);
      assert.equal(end, 101);
      return [
        {
          transactions: [
            confirmed("fee_public"),
            confirmed("fee_private"),
            confirmed("fee_public"),
            confirmed("fee_public", "50u64"),
          ],
        },
      ];
    },
  });
  assert.deepEqual(
    await Promise.all([service.getPriorityFee(), service.getPriorityFee()]),
    [0n, 0n],
  );
  assert.equal(await service.getPriorityFee(), 0n);
  assert.equal(calls, 1);
  advance(30001);
  assert.equal(await service.getPriorityFee(), 0n);
  assert.equal(calls, 2);
});
test("priority query failures preserve the recent estimate then expire to the existing fallback", async () => {
  let fail = false;
  const { service, advance } = feeHarness({
    getLatestHeight: async () => 100,
    getBlockRange: async () => {
      if (fail) throw Error("offline");
      return [{ transactions: [confirmed("fee_private", "7u64")] }];
    },
  });
  assert.equal(await service.getPriorityFee(), 7n);
  fail = true;
  advance(30001);
  assert.equal(await service.getPriorityFee(), 7n);
  advance(600000);
  assert.equal(await service.getPriorityFee(), 100000n);
});
test("base fee resolves imports in dependency order with editions and caches estimation", async () => {
  let estimates = 0;
  const { service, advance } = feeHarness(
    {
      getFeeProgram: async (id) => ({
        id,
        edition: id === "token.aleo" ? 2 : 0,
        source:
          id === "token.aleo"
            ? "// import ignored.aleo;\nimport helper.aleo;\nprogram token.aleo;"
            : `program ${id};`,
      }),
    },
    async (request) => {
      estimates++;
      assert.deepEqual(
        Array.from(request.programs, (p) => p.id),
        ["helper.aleo", "token.aleo"],
      );
      assert.deepEqual(
        Array.from(request.programs, (p) => p.edition),
        [0, 2],
      );
      assert.equal(request.functionName, "transfer_public");
      return 5474n;
    },
  );
  assert.deepEqual(
    await Promise.all([
      service.getBaseFee("token.aleo", "transfer_public"),
      service.getBaseFee("token.aleo", "transfer_public"),
    ]),
    [5474n, 5474n],
  );
  assert.equal(estimates, 1);
  advance(30001);
  await service.getBaseFee("token.aleo", "transfer_public");
  assert.equal(estimates, 2);
  assert.equal(await service.getBaseFee("credits.aleo", "split"), 10000n);
});
test("base fee errors are retried and never replaced by credits fees; cyclic imports fail", async () => {
  let attempts = 0;
  const { service } = feeHarness(
    {
      getFeeProgram: async (id) => ({
        id,
        edition: 0,
        source: `program ${id};`,
      }),
    },
    async () => {
      if (++attempts === 1) throw Error("estimate failed");
      return 3000n;
    },
  );
  await assert.rejects(
    service.getBaseFee("token.aleo", "transfer_public"),
    /estimate failed/,
  );
  assert.equal(
    await service.getBaseFee("token.aleo", "transfer_public"),
    3000n,
  );
  const cyclic = feeHarness({
    getFeeProgram: async (id) => ({
      id,
      edition: 0,
      source: `import ${id}; program ${id};`,
    }),
  });
  await assert.rejects(
    cyclic.service.getBaseFee("token.aleo", "transfer_public"),
    /Cyclic/,
  );
});
