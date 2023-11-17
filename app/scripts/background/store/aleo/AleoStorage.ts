import {
  StorageKey,
  aleoAccountStorageInstance,
  aleoBlockStorageInstance,
} from "@/common/utils/indexeddb";
import { IAleoStorage } from "core/coins/ALEO/types/IAleoStorage";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import {
  AleoAddressInfo,
  SyncBlockResultWithDuration,
} from "core/coins/ALEO/types/SyncTask";

export class AleoStorage implements IAleoStorage {
  static instance: AleoStorage;

  #aleoAccountStorage: LocalForage;
  #aleoBlockStorage: LocalForage;
  #aleoBlockStorageMap = new Map<string, LocalForage>();
  #aleoAccountStorageMap = new Map<string, LocalForage>();

  static getInstance() {
    if (!AleoStorage.instance) {
      AleoStorage.instance = new AleoStorage();
    }
    return AleoStorage.instance;
  }

  private constructor() {
    this.#aleoAccountStorage = aleoAccountStorageInstance;
    this.#aleoBlockStorage = aleoBlockStorageInstance;
  }

  private getAleoAccountInstance = (chainId: string) => {
    const key = `aleo-${chainId}`;
    const existInstance = this.#aleoAccountStorageMap.get(key);
    if (existInstance) {
      return existInstance;
    }
    const newInstance = this.#aleoAccountStorage.createInstance({
      name: "fox_wallet",
      storeName: key,
    });
    this.#aleoAccountStorageMap.set(key, newInstance);
    return newInstance;
  };

  private getAleoStorageInstance = (
    chainId: string,
    address: string,
    prefix: StorageKey,
  ) => {
    const key = `${chainId}-${prefix}-${address}`;
    const existInstance = this.#aleoBlockStorageMap.get(key);
    if (existInstance) {
      return existInstance;
    }
    const newInstance = this.#aleoBlockStorage.createInstance({
      name: chainId,
      storeName: `${prefix}-${address}`,
    });
    this.#aleoBlockStorageMap.set(key, newInstance);
    return newInstance;
  };

  async getAccountsAddress(chainId: string): Promise<string[]> {
    const instance = this.getAleoAccountInstance(chainId);
    return await instance.keys();
  }

  async getAccountInfo(
    chainId: string,
    address: string,
  ): Promise<AleoSyncAccount | undefined> {
    const instance = this.getAleoAccountInstance(chainId);

    const store = (await instance.getItem(address)) as
      | AleoSyncAccount
      | undefined;
    return store;
  }

  async setAccountInfo(
    chainId: string,
    account: AleoSyncAccount,
  ): Promise<AleoSyncAccount> {
    const instance = this.getAleoAccountInstance(chainId);
    return await instance.setItem(account.address, account);
  }

  async removeAccount(chainId: string, address: string) {
    const instance = this.getAleoAccountInstance(chainId);
    return await instance.removeItem(address);
  }

  async getAleoBlockRanges(
    chainId: string,
    address: string,
  ): Promise<string[]> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.BLOCK,
    );
    return await instance.keys();
  }

  async setAleoBlocks(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncBlockResultWithDuration,
  ): Promise<SyncBlockResultWithDuration> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.BLOCK,
    );
    return await instance.setItem(key, blockInfo);
  }

  async removeAleoBlock(chainId: string, address: string, key: string) {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.BLOCK,
    );
    return await instance.removeItem(key);
  }

  async getAleoBlockInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncBlockResultWithDuration | null> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.BLOCK,
    );
    return await instance.getItem(key);
  }

  async getAddressInfo(
    chainId: string,
    address: string,
  ): Promise<AleoAddressInfo | null> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.INFO,
    );
    return await instance.getItem(address);
  }

  async setAddressInfo(
    chainId: string,
    address: string,
    info: AleoAddressInfo,
  ): Promise<AleoAddressInfo> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.INFO,
    );
    return await instance.setItem(address, info);
  }
}
