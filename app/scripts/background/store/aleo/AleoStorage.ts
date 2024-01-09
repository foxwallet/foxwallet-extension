import {
  StorageKey,
  aleoAccountStorageInstance,
  aleoBlockStorageInstance,
} from "@/common/utils/indexeddb";
import { IAleoStorage } from "core/coins/ALEO/types/IAleoStorage";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import {
  AleoAddressInfo,
  SyncRecordResultWithDuration,
} from "core/coins/ALEO/types/SyncTask";
import { ProverKeyPair } from "core/coins/ALEO/types/ProverKeyPair";
import { AleoLocalTxInfo } from "core/coins/ALEO/types/Tranaction";
import { ALEO_CHAIN_IDS } from "core/coins/ALEO/config/chains";
import localforage from "localforage";

export class AleoStorage implements IAleoStorage {
  static instance: AleoStorage;

  #aleoBlockStorage: LocalForage;
  #aleoBlockStorageMap = new Map<string, LocalForage>();
  #aleoAccountStorage: LocalForage;
  #aleoProgramStorageMap = new Map<string, LocalForage>();

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
      driver: localforage.INDEXEDDB,
    });
    this.#aleoBlockStorageMap.set(key, newInstance);
    return newInstance;
  };

  private getAleoProgramStorageInstance = (
    chainId: string,
    programId: string,
  ) => {
    const key = `${chainId}-${programId}`;
    const existInstance = this.#aleoProgramStorageMap.get(key);
    if (existInstance) {
      return existInstance;
    }
    const newInstance = this.#aleoBlockStorage.createInstance({
      name: chainId,
      storeName: `program-${programId}`,
    });
    this.#aleoProgramStorageMap.set(key, newInstance);
    return newInstance;
  };

  async getAccountsAddress(): Promise<string[]> {
    const instance = this.#aleoAccountStorage;
    return await instance.keys();
  }

  async getAccountInfo(address: string): Promise<AleoSyncAccount | undefined> {
    const instance = this.#aleoAccountStorage;

    const store = (await instance.getItem(address)) as
      | AleoSyncAccount
      | undefined;
    return store;
  }

  async setAccountInfo(account: AleoSyncAccount): Promise<AleoSyncAccount> {
    const instance = this.#aleoAccountStorage;
    return await instance.setItem(account.address, account);
  }

  async removeAccount(address: string) {
    const instance = this.#aleoAccountStorage;
    await instance.removeItem(address);
    for (let chainId of ALEO_CHAIN_IDS) {
      await this.clearAccountBlockData(chainId, address);
    }
    return true;
  }

  async clearAccountBlockData(chainId: string, address: string) {
    try {
      const instance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.INFO,
      );
      let keys = await instance.keys();
      for (let key of keys) {
        await instance.removeItem(key);
      }
      const recordInstance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.RECORD,
      );
      keys = await recordInstance.keys();
      for (let key of keys) {
        await recordInstance.removeItem(key);
      }
      const txInstance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.LOCAL_TX,
      );
      keys = await txInstance.keys();
      for (let key of keys) {
        await txInstance.removeItem(key);
      }
    } catch (err) {
      console.error("clearAccountBlockData failed: ", err);
    }
  }

  async getAleoRecordRanges(
    chainId: string,
    address: string,
  ): Promise<string[]> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.RECORD,
    );
    return await instance.keys();
  }

  async setAleoRecords(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncRecordResultWithDuration,
  ): Promise<SyncRecordResultWithDuration> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.RECORD,
    );
    return await instance.setItem(key, blockInfo);
  }

  async removeAleoRecords(chainId: string, address: string, key: string) {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.RECORD,
    );
    return await instance.removeItem(key);
  }

  async getAleoRecordsInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncRecordResultWithDuration | null> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.RECORD,
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
    return await instance.setItem(address, { ...info });
  }

  async getAddressLocalTxIds(chainId: string, address: string) {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.LOCAL_TX,
    );
    return await instance.keys();
  }

  async getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.LOCAL_TX,
    );
    return await instance.getItem(localId);
  }

  async setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.LOCAL_TX,
    );
    await instance.setItem(info.localId, { ...info });
  }

  async removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void> {
    const instance = this.getAleoStorageInstance(
      chainId,
      address,
      StorageKey.LOCAL_TX,
    );
    await instance.removeItem(localId);
  }

  async clearAddressLocalData(
    chainId: string,
    address: string,
  ): Promise<boolean> {
    try {
      const txInstance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.LOCAL_TX,
      );
      await txInstance.clear();
      const recordInstance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.RECORD,
      );
      await recordInstance.clear();
      const infoInstance = this.getAleoStorageInstance(
        chainId,
        address,
        StorageKey.INFO,
      );
      await infoInstance.clear();
      return true;
    } catch (err) {
      console.error("===> clearAddressLocalData failed: ", err);
      return false;
    }
  }

  async getProgramContent(
    chainId: string,
    programId: string,
  ): Promise<string | null> {
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    return await instance.getItem("content");
  }

  async setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void> {
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    await instance.setItem("content", program);
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
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    const keyPair = (await instance.getItem(
      `${functionName}-keyPair`,
    )) as ProverKeyPair | null;
    if (!keyPair) {
      return null;
    }
    const { proverFile, verifierFile, proverSha1, verifierSha1 } = keyPair;
    const [existProverSha1, existVerifierSha1] = await Promise.all([
      this.calculateSHA1(proverFile),
      this.calculateSHA1(verifierFile),
    ]);
    if (existProverSha1 === proverSha1 && existVerifierSha1 === verifierSha1) {
      return {
        proverFile: proverFile,
        verifierFile: verifierFile,
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
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    const { proverFile, verifierFile } = keyPair;
    // const proverFile = keyPair.proverFile.copy().toBytes();
    // const verifierFile = keyPair.verifierFile.copy().toBytes();
    const [proverSha1, verifierSha1] = await Promise.all([
      this.calculateSHA1(proverFile),
      this.calculateSHA1(verifierFile),
    ]);
    if (!proverSha1 || !verifierSha1) {
      throw new Error("calculate keypair sha1 failed");
    }
    const value: ProverKeyPair = {
      proverFile,
      proverSha1,
      verifierFile,
      verifierSha1,
    };
    return await instance.setItem(`${functionName}-keyPair`, value);
  }
}
