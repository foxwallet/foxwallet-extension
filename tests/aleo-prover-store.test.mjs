import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import "fake-indexeddb/auto";

const root = fileURLToPath(new URL("../", import.meta.url));
const dir = await mkdtemp(join(tmpdir(), "fox-prover-store-"));
let api;
try {
  const outfile = join(dir, "store.mjs");
  await build({
    stdin: {
      contents: `export * from './offscreen_service/src/keyStore';
        export { AleoStorage } from './offscreen_service/src/AleoStorage';`,
      resolveDir: root,
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    plugins: [
      {
        name: "key-bindings",
        setup(build) {
          build.onResolve({ filter: /^@provablehq\/sdk\/mainnet.js$/ }, () => ({
            path: "sdk",
            namespace: "mock",
          }));
          build.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents: `
        export class ProvingKey {
          constructor(bytes) { this.bytes = bytes; }
          static fromBytes(bytes) {
            if (bytes[0] === 255) throw new Error('invalid serialized key');
            return new this(bytes);
          }
          toBytes() { return this.bytes; }
        }
        export class VerifyingKey extends ProvingKey {}
        export class AleoKeyProvider {
          async fetchBytes(url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error('download failed');
            return new Uint8Array(await response.arrayBuffer());
          }
        }
      `,
            loader: "js",
          }));
        },
      },
    ],
  });
  api = await import(pathToFileURL(outfile).href);
} finally {
  await rm(dir, { recursive: true, force: true });
}

const locator = (overrides = {}) => ({
  program: "parent.aleo",
  functionName: "run",
  edition: 0,
  amendment: 0,
  network: "mainnet",
  keyType: "prover",
  ...overrides,
});

test("SDK key locators isolate network, edition, amendment, type and SDK version", async () => {
  const storage = new api.AleoStorage(),
    chain = "prover-version-test";
  const store = new api.AleoKeyStore(chain, storage);
  const db = await storage.getBlockDBInstance(chain);
  try {
    const bytes = new Uint8Array([1, 2, 3]);
    await store.setKeyBytes(bytes, locator());
    assert.deepEqual(await store.getKeyBytes(locator()), bytes);
    for (const variation of [
      { edition: 1 },
      { amendment: 1 },
      { network: "testnet" },
      { keyType: "verifier" },
      { program: "child.aleo" },
      { functionName: "other" },
      { checksum: "incorrect" },
    ])
      assert.equal(await store.getKeyBytes(locator(variation)), null);
    await store.setKeyBytes(bytes, locator());
    const row = await db.sdkKeys.toCollection().first();
    const id = JSON.parse(row.id);
    assert.equal(id[0], api.KEY_CACHE_VERSION);
    id[0] = "old-sdk";
    await db.sdkKeys.delete(row.id);
    await db.sdkKeys.put({ ...row, id: JSON.stringify(id) });
    assert.equal(await store.getKeyBytes(locator()), null);
  } finally {
    await db.delete();
  }
});

test("same-length corruption evicts SDK and inclusion manifests with their chunks", async () => {
  const storage = new api.AleoStorage(),
    chain = "prover-corruption-test";
  const store = new api.AleoKeyStore(chain, storage);
  const db = await storage.getBlockDBInstance(chain);
  try {
    await store.setKeyBytes(new Uint8Array([1, 2]), locator());
    const row = await db.sdkKeys.toCollection().first();
    await db.keyChunks.update([row.bytes.keyId, 0], {
      bytes: new Uint8Array([1, 3]),
    });
    assert.equal(await store.getKeyBytes(locator()), null);
    assert.equal(await db.sdkKeys.count(), 0);
    assert.equal(await db.keyChunks.count(), 0);
    await storage.setInclusionProver(
      chain,
      new Uint8Array([3, 4]),
      "inclusion-v1",
    );
    const inclusion = await db.inclusionKeys.get("inclusion");
    await db.keyChunks.update([inclusion.proverBytes.keyId, 0], {
      bytes: new Uint8Array([3, 5]),
    });
    assert.equal(await storage.getInclusionProver(chain, "inclusion-v1"), null);
    assert.equal(await db.inclusionKeys.count(), 0);
    assert.equal(await db.keyChunks.count(), 0);
    await db.inclusionKeys.put({
      id: "inclusion",
      proverBytes: new Uint8Array([1]),
      sourceUrl: "inclusion-v1",
      fetchedAt: 0,
    });
    assert.equal(
      await storage.getInclusionProver(chain, "inclusion-v1"),
      null,
      "unverified legacy entry is refetched",
    );
  } finally {
    await db.delete();
  }
});

test("key pairs replace atomically and keep the previous pair on a partial write failure", async () => {
  const storage = new api.AleoStorage(),
    chain = "prover-atomic-test";
  const store = new api.AleoKeyStore(chain, storage);
  const db = await storage.getBlockDBInstance(chain);
  const pk = locator(),
    vk = locator({ keyType: "verifier" });
  const pair = (n) => [
    { toBytes: () => new Uint8Array([n]) },
    { toBytes: () => new Uint8Array([n + 1]) },
  ];
  try {
    await store.setKeys(pk, vk, pair(1));
    const before = await db.sdkKeys.toArray();
    let writes = 0;
    const fail = () => {
      if (++writes === 2) throw new Error("quota");
    };
    db.keyChunks.hook("creating", fail);
    await assert.rejects(store.setKeys(pk, vk, pair(3)), /quota/);
    db.keyChunks.hook("creating").unsubscribe(fail);
    assert.deepEqual(await db.sdkKeys.toArray(), before);
    assert.deepEqual(await store.getKeyBytes(pk), new Uint8Array([1]));
    await store.setKeys(pk, vk, pair(3));
    assert.equal(await db.keyChunks.count(), 2);
    assert.equal((await store.getKeyMetadata(vk)).size, 1);
    await storage.setInclusionProver(chain, new Uint8Array([7]), "inclusion");
    await store.clear();
    assert.equal(await db.sdkKeys.count(), 0);
    assert.equal(
      await db.keyChunks.count(),
      1,
      "unrelated inclusion chunks survive",
    );
  } finally {
    await db.delete();
  }
});

test("corruption eviction preserves an inclusion key replaced during checksum verification", async () => {
  const storage = new api.AleoStorage(),
    chain = "inclusion-replacement-race";
  const db = await storage.getBlockDBInstance(chain);
  try {
    await storage.setInclusionProver(
      chain,
      new Uint8Array([1, 2]),
      "inclusion",
    );
    const row = await db.inclusionKeys.get("inclusion");
    await db.keyChunks.update([row.proverBytes.keyId, 0], {
      bytes: new Uint8Array([1, 3]),
    });
    const checksum = storage.keyChecksum.bind(storage);
    let replaced = false;
    storage.keyChecksum = async (bytes) => {
      if (!replaced && bytes[1] === 3) {
        replaced = true;
        await storage.setInclusionProver(
          chain,
          new Uint8Array([4, 5]),
          "inclusion",
        );
      }
      return await checksum(bytes);
    };
    assert.equal(await storage.getInclusionProver(chain, "inclusion"), null);
    assert.deepEqual(
      await storage.getInclusionProver(chain, "inclusion"),
      new Uint8Array([4, 5]),
    );
    assert.equal(await db.keyChunks.count(), 1);
  } finally {
    await db.delete();
  }
});

test("downloaded fee keys survive new providers, corrupt caches, URL rotation and write failures", async () => {
  const storage = new api.AleoStorage(),
    chain = "fee-prover-test";
  const db = await storage.getBlockDBInstance(chain);
  const savedFetch = globalThis.fetch;
  let downloads = 0;
  globalThis.fetch = async () => {
    downloads++;
    return new Response(new Uint8Array([1, 2]));
  };
  try {
    for (let n = 0; n < 2; n++) {
      const provider = new api.CachedAleoKeyProvider(chain, storage);
      assert.deepEqual(
        (
          await provider.fetchProvingKey("https://synthetic.invalid/fee.v1")
        ).toBytes(),
        new Uint8Array([1, 2]),
      );
    }
    assert.equal(downloads, 1);
    const row = await db.sdkKeys.toCollection().first();
    await db.keyChunks.update([row.bytes.keyId, 0], {
      bytes: new Uint8Array([3, 4]),
    });
    await new api.CachedAleoKeyProvider(chain, storage).fetchProvingKey(
      "https://synthetic.invalid/fee.v1",
    );
    assert.equal(downloads, 2);
    await new api.CachedAleoKeyProvider(chain, storage).fetchProvingKey(
      "https://synthetic.invalid/fee.v2",
    );
    assert.equal(downloads, 3);
    const brokenStorage = {
      getCachedKeyEntry: async () => {
        throw new Error("read failed");
      },
      setCachedKeys: async () => {
        throw new Error("quota");
      },
    };
    const key = await new api.CachedAleoKeyProvider(
      chain,
      brokenStorage,
    ).fetchProvingKey("https://synthetic.invalid/fee.v3");
    assert.deepEqual(key.toBytes(), new Uint8Array([1, 2]));
    globalThis.fetch = async () => new Response(new Uint8Array([255]));
    await assert.rejects(
      new api.CachedAleoKeyProvider(chain, storage).fetchProvingKey(
        "https://synthetic.invalid/invalid",
      ),
      /invalid serialized key/,
    );
    assert.equal(
      await db.sdkKeys.count(),
      2,
      "invalid downloads are never persisted",
    );
  } finally {
    globalThis.fetch = savedFetch;
    await db.delete();
  }
});

for (const [method, keyType] of [
  ["getProvingKey", "prover"],
  ["getVerifyingKey", "verifier"],
]) {
  test(`parse-failure cleanup for ${method} preserves a concurrent replacement`, async () => {
    const storage = new api.AleoStorage(),
      chain = `parse-race-${keyType}`;
    const store = new api.AleoKeyStore(chain, storage);
    const db = await storage.getBlockDBInstance(chain);
    const key = locator({ keyType });
    const invalid = new Uint8Array([255]);
    const replacement = new Uint8Array([1, 2]);
    try {
      await store.setKeyBytes(invalid, key);
      assert.equal(await store[method](key), null);
      assert.equal(await db.sdkKeys.count(), 0);
      assert.equal(await db.keyChunks.count(), 0);

      await store.setKeyBytes(invalid, key);
      const checksum = storage.keyChecksum.bind(storage);
      let replaced = false;
      storage.keyChecksum = async (bytes) => {
        const value = await checksum(bytes);
        if (!replaced && bytes[0] === 255) {
          replaced = true;
          await store.setKeyBytes(replacement, key);
        }
        return value;
      };
      assert.equal(await store[method](key), null);
      assert.equal(replaced, true);
      assert.equal(await db.sdkKeys.count(), 1);
      assert.equal(await db.keyChunks.count(), 1);
      assert.deepEqual((await store[method](key)).toBytes(), replacement);

      await store.delete(key);
      assert.equal(await db.sdkKeys.count(), 0);
      assert.equal(await db.keyChunks.count(), 0);
    } finally {
      await db.delete();
    }
  });
}

for (const replace of [false, true]) {
  test(`download parse-failure cleanup ${
    replace ? "preserves a replacement" : "evicts the observed entry"
  } before refetching`, async () => {
    const storage = new api.AleoStorage(),
      chain = `download-parse-race-${replace}`;
    const db = await storage.getBlockDBInstance(chain);
    const url = "https://synthetic.invalid/parse-race";
    const id = JSON.stringify([api.KEY_CACHE_VERSION, "download", url]);
    const replacement = new Uint8Array([1, 2]);
    try {
      await storage.setCachedKeys(chain, [
        { id, bytes: new Uint8Array([255]) },
      ]);
      const checksum = storage.keyChecksum.bind(storage);
      let replaced = false;
      storage.keyChecksum = async (bytes) => {
        const value = await checksum(bytes);
        if (replace && !replaced && bytes[0] === 255) {
          replaced = true;
          await storage.setCachedKeys(chain, [{ id, bytes: replacement }]);
        }
        return value;
      };
      const provider = new api.CachedAleoKeyProvider(chain, storage);
      let downloads = 0;
      provider.fetchBytes = async () => {
        downloads++;
        assert.equal(await db.sdkKeys.count(), replace ? 1 : 0);
        assert.equal(await db.keyChunks.count(), replace ? 1 : 0);
        assert.deepEqual(
          await storage.getCachedKey(chain, id),
          replace ? replacement : null,
        );
        return new Uint8Array([3, 4]);
      };
      assert.deepEqual(
        (await provider.fetchProvingKey(url)).toBytes(),
        new Uint8Array([3, 4]),
      );
      assert.equal(downloads, 1);
      assert.equal(replaced, replace);
      assert.deepEqual(
        await storage.getCachedKey(chain, id),
        new Uint8Array([3, 4]),
      );
      assert.equal(await db.sdkKeys.count(), 1);
      assert.equal(await db.keyChunks.count(), 1);
    } finally {
      await db.delete();
    }
  });
}

test("source and key metadata use one pinned version per build and reject failed metadata", async () => {
  let latest = 1,
    requests = 0;
  const sources = [];
  const client = {
    async getProgramAmendmentCount(program_id) {
      requests++;
      return { program_id, edition: latest, amendment_count: 2 };
    },
    async getProgram(id, edition) {
      sources.push([id, edition]);
      return "source";
    },
  };
  api.pinProgramVersions(client);
  await client.getProgram("parent.aleo");
  latest = 2;
  assert.equal(
    (await client.getProgramAmendmentCount("parent.aleo")).edition,
    1,
  );
  await client.getProgram("parent.aleo");
  assert.deepEqual(sources, [
    ["parent.aleo", 1],
    ["parent.aleo", 1],
  ]);
  assert.equal(requests, 1);
  await client.getProgram("child.aleo");
  assert.deepEqual(sources.at(-1), ["child.aleo", 2]);
  const failed = {
    getProgramAmendmentCount: async () => {
      throw new Error("offline");
    },
    getProgram: async () => assert.fail("must not fetch unversioned source"),
  };
  api.pinProgramVersions(failed);
  await assert.rejects(failed.getProgram("parent.aleo"), /offline/);
});
