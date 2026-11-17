import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createContext, runInContext } from "node:vm";
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const dir = await mkdtemp(join(tmpdir(), "fox-inclusion-test-"));
let AleoStorage, BackgroundStorage, BackgroundDatabase, KEY_CHUNK_SIZE;
try {
  const outfile = join(dir, "storage.mjs");
  await build({
    stdin: {
      contents: `
        export { AleoStorage } from './offscreen_service/src/AleoStorage';
        export { AleoStorage as BackgroundStorage } from './app/scripts/background/store/aleo/AleoStorage';
        export { AleoBlockDatabase as BackgroundDatabase } from './app/database/AleoBlockDatabase';
        export { KEY_CHUNK_SIZE } from './core/coins/ALEO/utils/keyChunks';
      `,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
    plugins: [
      {
        name: "background-dependencies",
        setup(build) {
          build.onResolve(
            {
              filter:
                /^@\/common\/utils\/indexeddb$|^@\/database\/ScannerDatabase$|^core\/coins\/ALEO\/config\/chains$/,
            },
            ({ path }) => ({ path, namespace: "mock" }),
          );
          build.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents:
              'export const aleoAccountStorageInstance = {}; export const scannerDB = {}; export const ALEO_CHAIN_IDS = ["mainnet"];',
            loader: "js",
          }));
        },
      },
    ],
  });
  ({ AleoStorage, BackgroundStorage, BackgroundDatabase, KEY_CHUNK_SIZE } =
    await import(pathToFileURL(outfile).href));
} finally {
  await rm(dir, { recursive: true, force: true });
}

test("inclusion keys persist as chunk references and round-trip only the supplied byte range", async () => {
  const storage = new AleoStorage();
  const chain = "inclusion-blob-test";
  const db = await storage.getBlockDBInstance(chain);
  try {
    const bytes = new Uint8Array([99, 1, 2, 3, 99]).subarray(1, 4);
    await storage.setInclusionProver(chain, bytes, "key-v1");
    const row = await db.inclusionKeys.get("inclusion");
    assert.equal(row.proverBytes.kind, "chunks-v1");
    assert.equal(row.proverBytes.byteLength, 3);
    assert.equal(row.proverBytes.chunkCount, 1);
    assert.deepEqual(
      await storage.getInclusionProver(chain, "key-v1"),
      new Uint8Array([1, 2, 3]),
    );
    await storage.setInclusionProver(chain, new Uint8Array(), "key-v1");
    assert.deepEqual(
      await storage.getInclusionProver(chain, "key-v1"),
      new Uint8Array([1, 2, 3]),
    );
  } finally {
    await db.delete();
  }
});

test("legacy inclusion byte arrays remain readable and rotated or empty keys miss", async () => {
  const storage = new AleoStorage();
  const chain = "inclusion-legacy-test";
  const db = await storage.getBlockDBInstance(chain);
  try {
    await db.inclusionKeys.put({
      id: "inclusion",
      proverBytes: new Uint8Array([4, 5, 6]),
      sourceUrl: "key-v1",
      checksum: await storage.keyChecksum(new Uint8Array([4, 5, 6])),
      fetchedAt: 0,
    });
    assert.deepEqual(
      await storage.getInclusionProver(chain, "key-v1"),
      new Uint8Array([4, 5, 6]),
    );
    assert.equal(await storage.getInclusionProver(chain, "key-v2"), null);
    assert.equal(await db.inclusionKeys.count(), 0);
    await storage.setInclusionProver(chain, new Uint8Array([7]), "key-v1");
    assert.equal(await db.keyChunks.count(), 1);
    assert.equal(await storage.getInclusionProver(chain, "key-v2"), null);
    assert.equal(await db.keyChunks.count(), 0);
    await db.inclusionKeys.put({
      id: "inclusion",
      proverBytes: new Blob([new Uint8Array([8, 9])]),
      sourceUrl: "key-v2",
      checksum: await storage.keyChecksum(new Uint8Array([8, 9])),
      fetchedAt: 0,
    });
    assert.deepEqual(
      await storage.getInclusionProver(chain, "key-v2"),
      new Uint8Array([8, 9]),
    );
    for (const proverBytes of [new Uint8Array(), new Blob()]) {
      await db.inclusionKeys.put({
        id: "inclusion",
        proverBytes,
        sourceUrl: "key-v2",
        fetchedAt: 0,
      });
      assert.equal(await storage.getInclusionProver(chain, "key-v2"), null);
    }
  } finally {
    await db.delete();
  }
});

test("files cross 64 MiB chunk boundaries, replace old chunks and reject missing data", async () => {
  const storage = new AleoStorage();
  const chain = "inclusion-boundary-test";
  const db = await storage.getBlockDBInstance(chain);
  try {
    assert.equal(KEY_CHUNK_SIZE, 64 * 1024 * 1024);
    const bytes = new Uint8Array(KEY_CHUNK_SIZE + 3);
    bytes[0] = 1;
    bytes[KEY_CHUNK_SIZE - 1] = 2;
    bytes[KEY_CHUNK_SIZE] = 3;
    bytes[bytes.length - 1] = 4;
    await storage.setInclusionProver(chain, bytes, "key-v1");
    const row = await db.inclusionKeys.get("inclusion");
    const chunks = await db.keyChunks.toArray();
    assert.deepEqual(
      chunks.map((c) => c.bytes.byteLength),
      [KEY_CHUNK_SIZE, 3],
    );
    assert.ok(
      chunks.every((c) => c.bytes.buffer.byteLength === c.bytes.byteLength),
    );
    assert.deepEqual(await storage.getInclusionProver(chain, "key-v1"), bytes);
    await db.keyChunks.update([row.proverBytes.keyId, 1], {
      bytes: new Uint8Array(2),
    });
    assert.equal(await storage.getInclusionProver(chain, "key-v1"), null);
    await db.keyChunks.delete([row.proverBytes.keyId, 1]);
    assert.equal(await storage.getInclusionProver(chain, "key-v1"), null);
    await storage.setInclusionProver(chain, new Uint8Array([5]), "key-v1");
    assert.equal(await db.keyChunks.count(), 1);
    assert.deepEqual(
      await storage.getInclusionProver(chain, "key-v1"),
      new Uint8Array([5]),
    );
  } finally {
    await db.delete();
  }
});

const hash = async (bytes) =>
  Buffer.from(await crypto.subtle.digest("SHA-1", bytes)).toString("hex");

test("upgrading a version 8 database preserves legacy caches before adding chunks", async () => {
  const chain = "key-cache-upgrade";
  const legacy = new Dexie(chain);
  legacy.version(8).stores({
    txs: "localId, [address+programId], notification, tokenId",
    programs: "programId",
    cacheTxs: "txId",
    inclusionKeys: "id",
    txDetailCache: "txId",
  });
  const bytes = new Uint8Array([1, 2, 3]);
  await legacy.open();
  await legacy.table("programs").add({
    programId: "credits.aleo",
    content: "legacy source",
    keypairs: {
      join: {
        proverFile: bytes,
        verifierFile: bytes,
        proverSha1: await hash(bytes),
        verifierSha1: await hash(bytes),
      },
    },
  });
  await legacy.table("inclusionKeys").put({
    id: "inclusion",
    proverBytes: new Blob([bytes]),
    sourceUrl: "key-v1",
    checksum: Buffer.from(
      await crypto.subtle.digest("SHA-256", bytes),
    ).toString("hex"),
    fetchedAt: 0,
  });
  legacy.close();
  const storage = new AleoStorage();
  const db = await storage.getBlockDBInstance(chain);
  try {
    assert.equal(db.verno, 10);
    assert.deepEqual(
      await storage.getProgramKeyPair(chain, "credits.aleo", "join"),
      { proverFile: bytes, verifierFile: bytes },
    );
    assert.deepEqual(await storage.getInclusionProver(chain, "key-v1"), bytes);
    await storage.setProgramKeyPair(chain, "credits.aleo", "split", {
      proverFile: bytes,
      verifierFile: bytes,
    });
    assert.equal(await db.keyChunks.count(), 2);
    assert.equal(
      await storage.getProgramContent(chain, "credits.aleo"),
      "legacy source",
    );
  } finally {
    await db.delete();
  }
});

for (const [label, Storage] of [
  ["offscreen", AleoStorage],
  ["background", BackgroundStorage],
]) {
  test(`${label} program cache preserves legacy keys, concurrent functions and key integrity`, async () => {
    const storage = Storage.getInstance();
    const chain = `program-keys-${label}`;
    const db = await storage.getBlockDBInstance(chain);
    const prover = new Uint8Array([1, 2, 3]),
      verifier = new Uint8Array([4, 5]);
    try {
      await db.programs.add({
        programId: "credits.aleo",
        content: "program source",
        keypairs: {
          join: {
            proverFile: prover,
            verifierFile: new Blob([verifier]),
            proverSha1: await hash(prover),
            verifierSha1: await hash(verifier),
          },
        },
      });
      assert.deepEqual(
        await storage.getProgramKeyPair(chain, "credits.aleo", "join"),
        { proverFile: prover, verifierFile: verifier },
      );
      await Promise.all(
        ["split", "transfer_private"].map((fn) =>
          storage.setProgramKeyPair(chain, "credits.aleo", fn, {
            proverFile: prover,
            verifierFile: verifier,
          }),
        ),
      );
      const row = await db.programs.get("credits.aleo");
      assert.equal(row.content, "program source");
      assert.deepEqual(Object.keys(row.keypairs).sort(), [
        "join",
        "split",
        "transfer_private",
      ]);
      assert.deepEqual(
        await storage.getProgramKeyPair(chain, "credits.aleo", "split"),
        { proverFile: prover, verifierFile: verifier },
      );
      assert.equal(await db.keyChunks.count(), 4);
      await storage.setProgramKeyPair(chain, "credits.aleo", "split", {
        proverFile: new Uint8Array([7]),
        verifierFile: verifier,
      });
      assert.equal(
        await db.keyChunks.count(),
        4,
        "replacement removes old chunks",
      );
      const updated = await db.programs.get("credits.aleo");
      await db.keyChunks.update([updated.keypairs.split.proverFile.keyId, 0], {
        bytes: new Uint8Array([8]),
      });
      assert.equal(
        await storage.getProgramKeyPair(chain, "credits.aleo", "split"),
        null,
        "SHA-1 check rejects corrupted bytes",
      );
      await db.keyChunks.delete([
        updated.keypairs.transfer_private.proverFile.keyId,
        0,
      ]);
      assert.equal(
        await storage.getProgramKeyPair(
          chain,
          "credits.aleo",
          "transfer_private",
        ),
        null,
        "missing chunk is a cache miss",
      );
      assert.deepEqual(
        await storage.getProgramKeyPair(chain, "credits.aleo", "join"),
        { proverFile: prover, verifierFile: verifier },
      );
    } finally {
      await db.delete();
    }
  });
}

test("a failed replacement rolls back chunks and preserves the previous manifest", async () => {
  const storage = new AleoStorage(),
    chain = "key-rollback";
  const db = await storage.getBlockDBInstance(chain);
  const original = {
    proverFile: new Uint8Array([1]),
    verifierFile: new Uint8Array([2]),
  };
  try {
    await storage.setProgramKeyPair(chain, "credits.aleo", "split", original);
    const previous = await db.programs.get("credits.aleo");
    const fail = (key, row) => {
      if (row.index === 1) throw new Error("simulated quota error");
    };
    db.keyChunks.hook("creating", fail);
    await assert.rejects(
      storage.setProgramKeyPair(chain, "credits.aleo", "split", {
        proverFile: new Uint8Array(KEY_CHUNK_SIZE + 1),
        verifierFile: original.verifierFile,
      }),
      /simulated quota error/,
    );
    db.keyChunks.hook("creating").unsubscribe(fail);
    assert.deepEqual(await db.programs.get("credits.aleo"), previous);
    assert.equal(await db.keyChunks.count(), 2);
    assert.deepEqual(
      await storage.getProgramKeyPair(chain, "credits.aleo", "split"),
      original,
    );
  } finally {
    await db.delete();
  }
});

test("background reset clears chunk data and their owning cache rows together", async () => {
  const storage = new AleoStorage(),
    chain = "key-reset";
  const db = await storage.getBlockDBInstance(chain);
  let background;
  try {
    await storage.setProgramKeyPair(chain, "credits.aleo", "split", {
      proverFile: new Uint8Array([1]),
      verifierFile: new Uint8Array([2]),
    });
    await storage.setInclusionProver(chain, new Uint8Array([3]), "key-v1");
    await storage.setCachedKeys(chain, [
      { id: "sdk", bytes: new Uint8Array([4]) },
    ]);
    db.close();
    background = new BackgroundDatabase(chain);
    await background.open();
    await background.resetData();
    assert.equal(await background.programs.count(), 0);
    assert.equal(await background.table("inclusionKeys").count(), 0);
    assert.equal(await background.keyChunks.count(), 0);
    assert.equal(await background.sdkKeys.count(), 0);
  } finally {
    background?.close();
    await db.delete();
  }
});

const transactionBundle = await build({
  entryPoints: [root + "offscreen_service/src/transaction.ts"],
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  globalName: "api",
  plugins: [
    {
      name: "transaction-dependencies",
      setup(build) {
        const mocks = {
          "@provablehq/sdk/mainnet.js": `
            export class PrivateKey {} export class Program {}
            export class ProgramManager {
              constructor(...args) { globalThis.managerArgs = args; this.networkClient = {}; }
              async setInclusionProver(key) { globalThis.loadedInclusion = key; }
              async buildExecutionTransaction() { globalThis.built = "execution"; return globalThis.syntheticTx; }
              async buildDeploymentTransaction() { globalThis.built = "deployment"; return globalThis.syntheticTx; }
            } export class ProgramManagerBase {}
            export class RecordPlaintext {} export class ProvingKey { static fromBytes(bytes) { return { bytes }; } }
            export class VerifyingKey {}
            export const CREDITS_PROGRAM_KEYS = { inclusion: { prover: "https://parameters.provable.com/mainnet/inclusion.prover.test" } };
          `,
          "./keyStore":
            "export class AleoKeyStore {} export class CachedAleoKeyProvider {} export const pinProgramVersions = () => {};",
          "./AleoStorage":
            "export const AleoStorage = { getInstance: () => globalThis.storage };",
          "./instances/rpc": "export const createAleoRpcService = () => ({});",
        };
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

test("a cache write failure preserves the downloaded inclusion key for execution", async () => {
  const downloaded = new Uint8Array([1, 2, 3]);
  let writes = 0;
  const warnings = [];
  const context = createContext({
    Uint8Array,
    performance,
    console: { log() {}, warn: (...args) => warnings.push(args) },
    fetch: async () => new Response(downloaded),
    storage: {
      getInclusionProver: async () => null,
      async setInclusionProver(chain, bytes, url) {
        writes++;
        assert.equal(chain, "mainnet");
        assert.deepEqual(bytes, downloaded);
        assert.match(url, /^https:\/\/parameters\.provable\.com\//);
        throw new Error("cache quota exceeded");
      },
    },
  });
  runInContext(transactionBundle.outputFiles[0].text, context);
  const worker = new context.api.AleoTxWorker(0, [], false);
  assert.deepEqual(
    await worker.loadInclusionProverBytes("mainnet"),
    downloaded,
  );
  assert.equal(writes, 1);
  assert.match(warnings[0][0], /cache write failed/);
});

for (const operation of ["execution", "deployment", "public-deployment"]) {
  test(`${operation} configures persistent SDK keys and preloads inclusion before building`, async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const syntheticTx = { toString: () => JSON.stringify({ id: "synthetic" }) };
    const context = createContext({
      Uint8Array,
      performance,
      syntheticTx,
      console: { log() {}, warn() {}, error() {} },
      storage: { setAddressLocalTx: async () => {} },
    });
    runInContext(transactionBundle.outputFiles[0].text, context);
    const worker = new context.api.AleoTxWorker(0, [], false);
    worker.parsePrivateKey = () => ({});
    worker.parseProgram = () => ({});
    worker.loadInclusionProverBytes = async (chain) => {
      assert.notEqual(
        operation,
        "public-deployment",
        "public deployments do not need inclusion",
      );
      assert.equal(chain, "mainnet");
      return bytes;
    };
    worker.buildWithRpcFallback = async (_, build) =>
      await build("https://synthetic.invalid");
    worker.submitTransaction = async () => "synthetic";
    const params = {
      chainId: "mainnet",
      localId: "test",
      programId: "test.aleo",
      program: "synthetic",
      functionName: "calculate",
      inputs: [],
      baseFee: "0",
      priorityFee: "0",
      feeRecord:
        operation === "deployment" ? "synthetic fee record" : undefined,
    };
    if (operation === "execution") await worker.sendTransaction(params);
    else await worker.deploy(params);
    assert.equal(
      context.built,
      operation === "public-deployment" ? "deployment" : operation,
    );
    if (operation === "public-deployment")
      assert.equal(context.loadedInclusion, undefined);
    else assert.deepEqual(context.loadedInclusion.bytes, bytes);
    assert.equal(context.managerArgs[0], "https://synthetic.invalid");
    assert.equal(
      context.managerArgs[1].constructor.name,
      "CachedAleoKeyProvider",
    );
    assert.equal(context.managerArgs[4].constructor.name, "AleoKeyStore");
  });
}
