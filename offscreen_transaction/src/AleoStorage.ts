import { StorageKey, aleoBlockStorageInstance } from "./indexeddb";
import { ProverKeyPair } from "./types";
import { AleoLocalTxInfo } from "./types";

export class AleoStorage {
  static instance: AleoStorage;

  #aleoBlockStorage: LocalForage;
  #aleoBlockStorageMap = new Map<string, LocalForage>();
  #aleoProgramStorageMap = new Map<string, LocalForage>();

  static getInstance() {
    if (!AleoStorage.instance) {
      AleoStorage.instance = new AleoStorage();
    }
    return AleoStorage.instance;
  }

  private constructor() {
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
