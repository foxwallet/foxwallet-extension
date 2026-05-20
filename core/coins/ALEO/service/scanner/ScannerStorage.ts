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
    return await scannerStorage.setItem(this.uuidKey(chainId, address), entry);
  }

  async clearScannerUuid(chainId: string, address: string): Promise<void> {
    await scannerStorage.removeItem(this.uuidKey(chainId, address));
  }

  async clearAll(): Promise<void> {
    await scannerStorage.clear();
  }

  private uuidKey(chainId: string, address: string) {
    return `${SCANNER_UUID_PREFIX}:${chainId}:${address}`;
  }
}
