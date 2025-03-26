import { getBlockDatabaseByChainId } from "./database/AleoBlockDatabase";
import { type ProverKeyPair, type AleoLocalTxInfo } from "./types";

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
    const { proverFile, verifierFile, proverSha1, verifierSha1 } = keypair;
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
