import localForage from "localforage";
import {
  type JWTToken,
  type ProvableApiKey,
  type ScannerUuidEntry,
} from "./ScannerTypes";

const PROVABLE_API_KEY = "provable_api_key";
const PROVABLE_JWT = "provable_jwt";
const SCANNER_UUID_PREFIX = "scanner_uuid";

const scannerStorage = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "aleo_scanner",
});

export class ScannerStorage {
  static instance: ScannerStorage;
  private uuidOwnerIndex: Map<string, ScannerUuidEntry> | null = null;
  private uuidOwnerIndexPromise: Promise<Map<string, ScannerUuidEntry>> | null =
    null;

  static getInstance() {
    if (!ScannerStorage.instance) {
      ScannerStorage.instance = new ScannerStorage();
    }
    return ScannerStorage.instance;
  }

  private constructor() {}

  async getProvableApiKey(): Promise<ProvableApiKey | null> {
    return (await scannerStorage.getItem(PROVABLE_API_KEY)) ?? null;
  }

  async setProvableApiKey(apiKey: ProvableApiKey): Promise<ProvableApiKey> {
    return await scannerStorage.setItem(PROVABLE_API_KEY, apiKey);
  }

  async clearProvableApiKey(): Promise<void> {
    await scannerStorage.removeItem(PROVABLE_API_KEY);
  }

  async getJWTToken(): Promise<JWTToken | null> {
    return (await scannerStorage.getItem(PROVABLE_JWT)) ?? null;
  }

  async setJWTToken(token: JWTToken): Promise<JWTToken> {
    return await scannerStorage.setItem(PROVABLE_JWT, token);
  }

  async clearJWTToken(): Promise<void> {
    await scannerStorage.removeItem(PROVABLE_JWT);
  }

  async getScannerUuid(
    chainId: string,
    address: string,
  ): Promise<string | null> {
    const entry = await scannerStorage.getItem<ScannerUuidEntry>(
      this.uuidKey(chainId, address),
    );
    return entry?.uuid ?? null;
  }

  async setScannerUuid(
    chainId: string,
    address: string,
    uuid: string,
  ): Promise<ScannerUuidEntry> {
    const entry: ScannerUuidEntry = {
      chainId,
      address,
      uuid,
    };
    const saved = await scannerStorage.setItem(
      this.uuidKey(chainId, address),
      entry,
    );
    await this.updateUuidOwnerIndex(saved);
    return saved;
  }

  async clearScannerUuid(chainId: string, address: string): Promise<void> {
    const entry = await scannerStorage.getItem<ScannerUuidEntry>(
      this.uuidKey(chainId, address),
    );
    await scannerStorage.removeItem(this.uuidKey(chainId, address));
    await this.removeUuidOwnerIndexEntry(chainId, address, entry?.uuid);
  }

  async findScannerUuidOwner(uuid: string): Promise<ScannerUuidEntry | null> {
    const index = await this.getUuidOwnerIndex();
    return index.get(uuid) ?? null;
  }

  async clearScannerUuidByUuid(uuid: string): Promise<void> {
    const entry = await this.findScannerUuidOwner(uuid);
    if (!entry) return;
    await this.clearScannerUuid(entry.chainId, entry.address);
  }

  async clearAll(): Promise<void> {
    await scannerStorage.clear();
    this.uuidOwnerIndex = null;
    this.uuidOwnerIndexPromise = null;
  }

  private uuidKey(chainId: string, address: string) {
    return `${SCANNER_UUID_PREFIX}:${chainId}:${address}`;
  }

  private async getUuidOwnerIndex(): Promise<Map<string, ScannerUuidEntry>> {
    if (this.uuidOwnerIndex) {
      return this.uuidOwnerIndex;
    }
    if (!this.uuidOwnerIndexPromise) {
      this.uuidOwnerIndexPromise = this.buildUuidOwnerIndex();
    }
    try {
      this.uuidOwnerIndex = await this.uuidOwnerIndexPromise;
      return this.uuidOwnerIndex;
    } finally {
      this.uuidOwnerIndexPromise = null;
    }
  }

  private async getLoadedUuidOwnerIndex(): Promise<Map<
    string,
    ScannerUuidEntry
  > | null> {
    if (this.uuidOwnerIndex) {
      return this.uuidOwnerIndex;
    }
    if (!this.uuidOwnerIndexPromise) {
      return null;
    }
    try {
      this.uuidOwnerIndex = await this.uuidOwnerIndexPromise;
      return this.uuidOwnerIndex;
    } finally {
      this.uuidOwnerIndexPromise = null;
    }
  }

  private async buildUuidOwnerIndex(): Promise<Map<string, ScannerUuidEntry>> {
    const index = new Map<string, ScannerUuidEntry>();
    await scannerStorage.iterate<ScannerUuidEntry, undefined>((value, key) => {
      if (key.startsWith(`${SCANNER_UUID_PREFIX}:`) && value?.uuid) {
        index.set(value.uuid, value);
      }
      return undefined;
    });
    return index;
  }

  private async updateUuidOwnerIndex(entry: ScannerUuidEntry): Promise<void> {
    const index = await this.getLoadedUuidOwnerIndex();
    if (!index) return;
    this.deleteUuidOwnerIndexEntry(index, entry.chainId, entry.address);
    index.set(entry.uuid, entry);
  }

  private async removeUuidOwnerIndexEntry(
    chainId: string,
    address: string,
    uuid?: string,
  ): Promise<void> {
    const index = await this.getLoadedUuidOwnerIndex();
    if (!index) return;
    if (uuid) {
      index.delete(uuid);
      return;
    }
    this.deleteUuidOwnerIndexEntry(index, chainId, address);
  }

  private deleteUuidOwnerIndexEntry(
    index: Map<string, ScannerUuidEntry>,
    chainId: string,
    address: string,
  ): void {
    for (const [uuid, entry] of index.entries()) {
      if (entry.chainId === chainId && entry.address === address) {
        index.delete(uuid);
      }
    }
  }
}
