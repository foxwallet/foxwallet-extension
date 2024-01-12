import { getBlockDatabaseByChainId } from "./database/AleoBlockDatabase";
import { ProverKeyPair } from "./types";
import { AleoLocalTxInfo } from "./types";

export class AleoStorage {
  static instance: AleoStorage;

  // #aleoBlockStorage: LocalForage;
  // #aleoBlockStorageMap = new Map<string, LocalForage>();
  // #aleoAccountStorage: LocalForage;
  // #aleoProgramStorageMap = new Map<string, LocalForage>();

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

  async getAddressLocalTxs(chainId: string, address: string) {
    // const instance = this.getAleoStorageInstance(
    //   chainId,
    //   address,
    //   StorageKey.LOCAL_TX,
    // );
    // return await instance.keys();
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ address: address }).toArray();
    return data;
  }

  async getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null> {
    // const instance = this.getAleoStorageInstance(
    //   chainId,
    //   address,
    //   StorageKey.LOCAL_TX,
    // );
    // return await instance.getItem(localId);
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ localId }).first();
    return data ? data : null;
  }

  async setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void> {
    // const instance = this.getAleoStorageInstance(
    //   chainId,
    //   address,
    //   StorageKey.LOCAL_TX,
    // );
    // await instance.setItem(info.localId, { ...info });
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.put(info, "localId");
  }

  async removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void> {
    // const instance = this.getAleoStorageInstance(
    //   chainId,
    //   address,
    //   StorageKey.LOCAL_TX,
    // );
    // await instance.removeItem(localId);
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
    // const instance = this.getAleoProgramStorageInstance(chainId, programId);
    // return await instance.getItem("content");
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.programs
      .where({ programId: programId })
      .first();
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
    // const instance = this.getAleoProgramStorageInstance(chainId, programId);
    // await instance.setItem("content", program);
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
    // const instance = this.getAleoProgramStorageInstance(chainId, programId);
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.programs.where({ programId }).first();
    if (!data) {
      return null;
    }
    const keypair = data.keypairs[functionName];
    if (!keypair) {
      return null;
    }
    // const keyPair = (await instance.getItem(
    //   `${functionName}-keyPair`,
    // )) as ProverKeyPair | null;
    // if (!keyPair) {
    //   return null;
    // }
    const { proverFile, verifierFile, proverSha1, verifierSha1 } = keypair;
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
    // const instance = this.getAleoProgramStorageInstance(chainId, programId);
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
    const instance = await this.getBlockDBInstance(chainId);
    const count = await instance.programs.where({ programId }).count();
    if (count) {
      await instance.programs.where({ programId }).modify((data) => {
        data.keypairs[functionName] = value;
      });
    } else {
      await instance.programs.add({
        programId,
        content: "",
        keypairs: {
          [functionName]: value,
        },
      });
    }
  }
}
