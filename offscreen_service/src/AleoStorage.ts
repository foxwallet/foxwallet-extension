import { getBlockDatabaseByChainId } from "./database/AleoBlockDatabase";
import {
  INCLUSION_KEY_ROW_ID,
  type InclusionKey,
} from "./database/types/inclusionKey";
import { type ProverKeyPair, type AleoLocalTxInfo } from "./types";
import {
  deleteKeyBytes,
  readKeyBytes,
  writeKeyBytes,
} from "../../core/coins/ALEO/utils/keyChunks";
import type { CachedKey } from "../../core/coins/ALEO/types/CachedKey";

export class AleoStorage {
  static instance: AleoStorage;

  static getInstance() {
    if (!AleoStorage.instance) {
      AleoStorage.instance = new AleoStorage();
    }
    return AleoStorage.instance;
  }

  async getBlockDBInstance(chainId: string) {
    const instance = getBlockDatabaseByChainId(chainId);
    if (!instance.isOpen()) {
      await instance.open();
    }
    return instance;
  }

  async keyChecksum(bytes: Uint8Array): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
  }

  async getCachedKey(chainId: string, id: string, expectedChecksum?: string) {
    const db = await this.getBlockDBInstance(chainId);
    const row = await db.sdkKeys.get(id);
    if (!row) return null;
    const bytes = await readKeyBytes(db.keyChunks, row.bytes);
    if (
      bytes?.byteLength &&
      (!expectedChecksum || row.checksum === expectedChecksum) &&
      (await this.keyChecksum(bytes)) === row.checksum
    ) {
      return bytes;
    }
    // Compare the manifest under the lock: a concurrent replacement must survive.
    await this.deleteCachedKey(chainId, id, row.bytes.keyId);
    return null;
  }

  async setCachedKeys(
    chainId: string,
    entries: Array<{ id: string; bytes: Uint8Array; checksum?: string }>,
  ) {
    const checked = await Promise.all(
      entries.map(async (entry) => {
        const checksum = await this.keyChecksum(entry.bytes);
        if (
          !entry.bytes.byteLength ||
          (entry.checksum && entry.checksum !== checksum)
        ) {
          throw new Error("Invalid Aleo key checksum or empty key");
        }
        return { ...entry, checksum };
      }),
    );
    const db = await this.getBlockDBInstance(chainId);
    await db.transaction("rw", db.sdkKeys, db.keyChunks, async () => {
      for (const entry of checked) {
        const previous = await db.sdkKeys.get(entry.id);
        const row: CachedKey = {
          id: entry.id,
          bytes: await writeKeyBytes(db.keyChunks, entry.bytes),
          checksum: entry.checksum,
        };
        await db.sdkKeys.put(row);
        await deleteKeyBytes(db.keyChunks, previous?.bytes);
      }
    });
  }

  async deleteCachedKey(chainId: string, id: string, expectedKeyId?: string) {
    const db = await this.getBlockDBInstance(chainId);
    await db.transaction("rw", db.sdkKeys, db.keyChunks, async () => {
      const row = await db.sdkKeys.get(id);
      if (!row || (expectedKeyId && row.bytes.keyId !== expectedKeyId)) return;
      await db.sdkKeys.delete(id);
      await deleteKeyBytes(db.keyChunks, row.bytes);
    });
  }

  async clearCachedKeys(chainId: string) {
    const db = await this.getBlockDBInstance(chainId);
    await db.transaction("rw", db.sdkKeys, db.keyChunks, async () => {
      for (const row of await db.sdkKeys.toArray()) {
        await deleteKeyBytes(db.keyChunks, row.bytes);
      }
      await db.sdkKeys.clear();
    });
  }

  async getCachedKeyMetadata(chainId: string, id: string) {
    const db = await this.getBlockDBInstance(chainId);
    const row = await db.sdkKeys.get(id);
    return row ? { checksum: row.checksum, size: row.bytes.byteLength } : null;
  }

  async getAddressLocalTxs(chainId: string, address: string) {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ address }).toArray();
    return data;
  }

  async getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ localId }).first();
    return data ?? null;
  }

  async setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.put(info, "localId");
  }

  async removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.delete(localId);
  }

  async clearAddressLocalData(chainId: string, address: string): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.deleteAddressData(address);
  }

  async getProgramContent(
    chainId: string,
    programId: string,
  ): Promise<string | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.programs.where({ programId }).first();
    if (!data) {
      return null;
    }
    return data.content;
  }

  async setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    const count = await instance.programs.where({ programId }).count();
    if (count) {
      await instance.programs.where({ programId }).modify((data) => {
        data.content = program;
      });
    } else {
      await instance.programs.add({
        programId,
        content: program,
        keypairs: {},
      });
    }
  }

  private async calculateSHA1(data: Uint8Array): Promise<string> {
    return crypto.subtle
      .digest("SHA-1", data)
      .then((hash) => {
        return Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      })
      .catch((e) => {
        console.error("SHA-1 calculation failed:", e);
        return "";
      });
  }

  async getProgramKeyPair(
    chainId: string,
    programId: string,
    functionName: string,
  ): Promise<{ proverFile: Uint8Array; verifierFile: Uint8Array } | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.programs.where({ programId }).first();
    if (!data) {
      return null;
    }
    const keypair = data.keypairs[functionName];
    if (!keypair) {
      return null;
    }
    const { proverSha1, verifierSha1 } = keypair;
    const [proverFile, verifierFile] = await Promise.all([
      readKeyBytes(instance.keyChunks, keypair.proverFile),
      readKeyBytes(instance.keyChunks, keypair.verifierFile),
    ]);
    if (!proverFile || !verifierFile) return null;
    const [existProverSha1, existVerifierSha1] = await Promise.all([
      this.calculateSHA1(proverFile),
      this.calculateSHA1(verifierFile),
    ]);
    if (existProverSha1 === proverSha1 && existVerifierSha1 === verifierSha1) {
      return {
        proverFile,
        verifierFile,
      };
    } else {
      console.error("Cached prover is broken ", programId, functionName);
    }
    return null;
  }

  async setProgramKeyPair(
    chainId: string,
    programId: string,
    functionName: string,
    keyPair: { proverFile: Uint8Array; verifierFile: Uint8Array },
  ) {
    const { proverFile, verifierFile } = keyPair;
    const [proverSha1, verifierSha1] = await Promise.all([
      this.calculateSHA1(proverFile),
      this.calculateSHA1(verifierFile),
    ]);
    if (!proverSha1 || !verifierSha1) {
      throw new Error("calculate keypair sha1 failed");
    }
    const instance = await this.getBlockDBInstance(chainId);
    await instance.transaction(
      "rw",
      instance.programs,
      instance.keyChunks,
      async () => {
        const data = (await instance.programs.get(programId)) ?? {
          programId,
          content: "",
          keypairs: {},
        };
        const previous = data.keypairs[functionName];
        const value: ProverKeyPair = {
          proverFile: await writeKeyBytes(instance.keyChunks, proverFile),
          verifierFile: await writeKeyBytes(instance.keyChunks, verifierFile),
          proverSha1,
          verifierSha1,
        };
        data.keypairs[functionName] = value;
        await instance.programs.put(data);
        await deleteKeyBytes(instance.keyChunks, previous?.proverFile);
        await deleteKeyBytes(instance.keyChunks, previous?.verifierFile);
      },
    );
  }

  // Returns the cached inclusion prover bytes for this chain, or null if no
  // valid entry exists. `expectedSourceUrl` lets the caller invalidate the
  // cache when the upstream filename (which embeds a version hash) rotates.
  async getInclusionProver(
    chainId: string,
    expectedSourceUrl: string,
  ): Promise<Uint8Array | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const row = await instance.inclusionKeys.get(INCLUSION_KEY_ROW_ID);
    if (!row) {
      return null;
    }
    const bytes =
      row.sourceUrl === expectedSourceUrl && row.checksum
        ? await readKeyBytes(instance.keyChunks, row.proverBytes)
        : null;
    if (
      !bytes?.byteLength ||
      (await this.keyChecksum(bytes)) !== row.checksum
    ) {
      // Rotated, unverified or corrupt entries must be downloaded again.
      await instance.transaction(
        "rw",
        instance.inclusionKeys,
        instance.keyChunks,
        async () => {
          // Re-read under the write lock so a concurrent replacement survives.
          const current =
            await instance.inclusionKeys.get(INCLUSION_KEY_ROW_ID);
          if (
            current &&
            current.revision === row.revision &&
            current.sourceUrl === row.sourceUrl
          ) {
            await instance.inclusionKeys.delete(INCLUSION_KEY_ROW_ID);
            await deleteKeyBytes(instance.keyChunks, current.proverBytes);
          }
        },
      );
      return null;
    }
    return bytes;
  }

  async setInclusionProver(
    chainId: string,
    proverBytes: Uint8Array,
    sourceUrl: string,
  ): Promise<void> {
    if (proverBytes.byteLength === 0) {
      return;
    }
    const checksum = await this.keyChecksum(proverBytes);
    const instance = await this.getBlockDBInstance(chainId);
    await instance.transaction(
      "rw",
      instance.inclusionKeys,
      instance.keyChunks,
      async () => {
        const previous = await instance.inclusionKeys.get(INCLUSION_KEY_ROW_ID);
        const record: InclusionKey = {
          id: INCLUSION_KEY_ROW_ID,
          proverBytes: await writeKeyBytes(instance.keyChunks, proverBytes),
          checksum,
          revision: crypto.randomUUID(),
          sourceUrl,
          fetchedAt: Date.now(),
        };
        await instance.inclusionKeys.put(record);
        await deleteKeyBytes(instance.keyChunks, previous?.proverBytes);
      },
    );
  }

  async deleteInclusionProver(chainId: string, expectedChecksum?: string) {
    const db = await this.getBlockDBInstance(chainId);
    await db.transaction("rw", db.inclusionKeys, db.keyChunks, async () => {
      const row = await db.inclusionKeys.get(INCLUSION_KEY_ROW_ID);
      if (!row || (expectedChecksum && row.checksum !== expectedChecksum))
        return;
      await db.inclusionKeys.delete(INCLUSION_KEY_ROW_ID);
      await deleteKeyBytes(db.keyChunks, row.proverBytes);
    });
  }
}
