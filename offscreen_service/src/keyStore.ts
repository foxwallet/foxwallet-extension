import {
  AleoKeyProvider,
  ProvingKey,
  VerifyingKey,
  type KeyStore,
  type KeyLocator,
  type ProvingKeyLocator,
  type VerifyingKeyLocator,
  type FunctionKeyPair,
  type AleoNetworkClient,
} from "@provablehq/sdk/mainnet.js";
import { dependencies } from "../../package.json";
import { AleoStorage } from "./AleoStorage";

// An SDK upgrade may change the circuit even when the program is unchanged.
export const KEY_CACHE_VERSION = dependencies["@provablehq/sdk"];

// Resolve once per build, then fetch the source for that exact edition. SDK
// source resolution and key locators must refer to the same program revision.
export function pinProgramVersions(client: AleoNetworkClient) {
  const getVersion = client.getProgramAmendmentCount.bind(client);
  const getProgram = client.getProgram.bind(client);
  const versions = new Map<string, ReturnType<typeof getVersion>>();
  client.getProgramAmendmentCount = async (id) => {
    let pending = versions.get(id);
    if (!pending) {
      pending = getVersion(id).then((version) => {
        if (
          !Number.isSafeInteger(version.edition) ||
          version.edition < 0 ||
          version.edition > 65535 ||
          !Number.isSafeInteger(version.amendment_count) ||
          version.amendment_count < 0
        ) {
          throw new Error("Invalid Aleo program version");
        }
        return version;
      });
      versions.set(id, pending);
    }
    return pending;
  };
  client.getProgram = async (id, edition) => {
    const version = await client.getProgramAmendmentCount(id);
    return await getProgram(id, edition ?? version.edition);
  };
}

export class AleoKeyStore implements KeyStore {
  constructor(
    private readonly chainId: string,
    private readonly storage = AleoStorage.getInstance(),
  ) {}

  private id(locator: KeyLocator) {
    return JSON.stringify([
      KEY_CACHE_VERSION,
      locator.network,
      locator.program,
      locator.functionName,
      locator.edition,
      locator.amendment,
      locator.keyType,
      ...(locator.keyType === "translation"
        ? [locator.recordName, locator.recordInputPosition]
        : []),
    ]);
  }

  async getKeyBytes(locator: KeyLocator) {
    try {
      return await this.storage.getCachedKey(
        this.chainId,
        this.id(locator),
        locator.checksum,
      );
    } catch (err) {
      console.warn("[ProgramKeys] cache read failed:", err);
      return null;
    }
  }

  async getProvingKey(locator: ProvingKeyLocator) {
    const bytes = await this.getKeyBytes(locator);
    if (!bytes) return null;
    try {
      return ProvingKey.fromBytes(bytes);
    } catch {
      await this.delete(locator);
      return null;
    }
  }

  async getVerifyingKey(locator: VerifyingKeyLocator) {
    const bytes = await this.getKeyBytes(locator);
    if (!bytes) return null;
    try {
      return VerifyingKey.fromBytes(bytes);
    } catch {
      await this.delete(locator);
      return null;
    }
  }

  async setKeys(
    prover: ProvingKeyLocator,
    verifier: VerifyingKeyLocator,
    [pk, vk]: FunctionKeyPair,
  ) {
    await this.storage.setCachedKeys(this.chainId, [
      { id: this.id(prover), bytes: pk.toBytes(), checksum: prover.checksum },
      {
        id: this.id(verifier),
        bytes: vk.toBytes(),
        checksum: verifier.checksum,
      },
    ]);
  }

  async setKeyBytes(bytes: Uint8Array, locator: KeyLocator) {
    await this.storage.setCachedKeys(this.chainId, [
      { id: this.id(locator), bytes, checksum: locator.checksum },
    ]);
  }

  async getKeyMetadata(locator: KeyLocator) {
    const bytes = await this.getKeyBytes(locator);
    if (!bytes) return null;
    return {
      checksum: await this.storage.keyChecksum(bytes),
      size: bytes.length,
    };
  }

  async has(locator: KeyLocator) {
    try {
      const metadata = await this.storage.getCachedKeyMetadata(
        this.chainId,
        this.id(locator),
      );
      return (
        !!metadata &&
        (!locator.checksum || metadata.checksum === locator.checksum)
      );
    } catch {
      return false;
    }
  }

  async delete(locator: KeyLocator) {
    await this.storage.deleteCachedKey(this.chainId, this.id(locator));
  }

  async clear() {
    await this.storage.clearCachedKeys(this.chainId);
  }
}

// The SDK's default provider only has an optional in-memory cache. Workers
// end after each task, so use the same bounded disk cache for downloaded keys.
export class CachedAleoKeyProvider extends AleoKeyProvider {
  constructor(
    private readonly chainId: string,
    private readonly storage = AleoStorage.getInstance(),
  ) {
    super();
  }

  async fetchProvingKey(url: string): Promise<ProvingKey> {
    const id = JSON.stringify([KEY_CACHE_VERSION, "download", url]);
    try {
      const bytes = await this.storage.getCachedKey(this.chainId, id);
      if (bytes) {
        try {
          return ProvingKey.fromBytes(bytes);
        } catch {
          await this.storage.deleteCachedKey(this.chainId, id);
        }
      }
    } catch (err) {
      console.warn("[ProverDownload] cache read failed:", err);
    }
    const bytes = await this.fetchBytes(url);
    // Validate the download before caching it. Persistence must not discard a
    // valid key when the disk is full or IndexedDB is unavailable.
    const key = ProvingKey.fromBytes(bytes);
    try {
      await this.storage.setCachedKeys(this.chainId, [{ id, bytes }]);
    } catch (err) {
      console.warn("[ProverDownload] cache write failed:", err);
    }
    return key;
  }
}
