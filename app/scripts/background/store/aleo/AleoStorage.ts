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
import { ProvingKey, VerifyingKey } from "aleo_wasm";
import { ProverKeyPair } from "core/coins/ALEO/types/ProverKeyPair";
import {
  AleoLocalTxInfo,
  AleoTransaction,
  AleoTxWithTime,
} from "core/coins/ALEO/types/Tranaction";

export class AleoStorage implements IAleoStorage {
  static instance: AleoStorage;

  #aleoBlockStorage: LocalForage;
  #aleoBlockStorageMap = new Map<string, LocalForage>();
  #aleoAccountStorage: LocalForage;
  #aleoAccountStorageMap = new Map<string, LocalForage>();
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

  async getProgramContent(
    chainId: string,
    programId: string,
  ): Promise<string | null> {
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    return await instance.getItem("content");
  }

  async setProgramContent(chainId: string, programId: string, program: string) {
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    return await instance.setItem("content", program);
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
  ): Promise<{ proverFile: ProvingKey; verifierFile: VerifyingKey } | null> {
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
        proverFile: ProvingKey.fromBytes(proverFile),
        verifierFile: VerifyingKey.fromBytes(verifierFile),
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
    keyPair: { proverFile: ProvingKey; verifierFile: VerifyingKey },
  ) {
    const instance = this.getAleoProgramStorageInstance(chainId, programId);
    const proverFile = keyPair.proverFile.copy().toBytes();
    const verifierFile = keyPair.verifierFile.copy().toBytes();
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
