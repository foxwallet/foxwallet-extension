import { aleoAccountStorageInstance } from "@/common/utils/indexeddb";
import { IAleoStorage } from "core/coins/ALEO/types/IAleoStorage";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import {
  AleoAddressInfo,
  SyncRecordResultWithDuration,
} from "core/coins/ALEO/types/SyncTask";
import { ProverKeyPair } from "core/coins/ALEO/types/ProverKeyPair";
import { AleoLocalTxInfo } from "core/coins/ALEO/types/Transaction";
import { ALEO_CHAIN_IDS } from "core/coins/ALEO/config/chains";
import { getBlockDatabaseByChainId } from "@/database/AleoBlockDatabase";
import { AleoOnChainHistoryItem } from "core/coins/ALEO/types/History";

export class AleoStorage implements IAleoStorage {
  static instance: AleoStorage;

  #aleoAccountStorage: LocalForage;

  static getInstance() {
    if (!AleoStorage.instance) {
      AleoStorage.instance = new AleoStorage();
    }
    return AleoStorage.instance;
  }

  private constructor() {
    this.#aleoAccountStorage = aleoAccountStorageInstance;
  }

  async getBlockDBInstance(chainId: string) {
    const instance = getBlockDatabaseByChainId(chainId);
    if (!instance.isOpen()) {
      await instance.open();
    }
    return instance;
  }

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
      await this.clearAddressLocalData(chainId, address);
    }
    return true;
  }

  async getAleoRecordRanges(
    chainId: string,
    address: string,
  ): Promise<string[]> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.records.where({ address: address }).toArray();
    return data.map((item) => `${item.begin}-${item.end}`);
  }

  async getAleoRecords(
    chainId: string,
    address: string,
  ): Promise<SyncRecordResultWithDuration[]> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.records
      .where({ address: address })
      .sortBy("begin");
    return data.map((item) => ({
      ...item,
      range: [item.begin, item.end],
    }));
  }

  async setAleoRecords(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncRecordResultWithDuration,
  ): Promise<SyncRecordResultWithDuration> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = {
      address: address,
      begin: blockInfo.range[0],
      end: blockInfo.range[1],
      recordsMap: blockInfo.recordsMap,
      measure: blockInfo.measure,
    };
    await instance.setRecords(address, data);
    return blockInfo;
  }

  async getAleoRecordsInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncRecordResultWithDuration | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const keyArr = key.split("-");
    const begin = parseInt(keyArr[0]);
    const end = parseInt(keyArr[1]);
    const data = await instance.records
      .where({ address: address, begin: begin, end: end })
      .first();
    if (!data) {
      return null;
    }
    return {
      ...data,
      range: [data.begin, data.end],
    };
  }

  async getAddressInfo(
    chainId: string,
    address: string,
  ): Promise<AleoAddressInfo | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.infos.where({ address: address }).first();
    if (!data) {
      return null;
    }
    return {
      ...data,
      range: [data.begin, data.end],
    };
  }

  async setAddressInfo(
    chainId: string,
    address: string,
    info: AleoAddressInfo,
  ): Promise<AleoAddressInfo> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = {
      address: address,
      begin: info.range[0],
      end: info.range[1],
      recordsMap: info.recordsMap,
    };
    await instance.infos.put(data, "address");
    return info;
  }

  async getAddressLocalTxs(chainId: string, address: string) {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ address: address }).toArray();
    return data;
  }

  async getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null> {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.txs.where({ localId }).first();
    return data ? data : null;
  }

  async setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.put(info, "localId");
  }

  async setLocalTxNotification(chainId: string, localId: string) {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.update(localId, { notification: true });
  }

  async removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txs.delete(localId);
  }

  async cacheTransaction(chainId: string, tx: AleoOnChainHistoryItem) {
    const instance = await this.getBlockDBInstance(chainId);
    const count = await instance.cacheTxs.where({ txId: tx.txId }).count();
    if (count) {
      await instance.cacheTxs.where({ txId: tx.txId }).modify((data) => {
        Object.assign(data, tx);
      });
    } else {
      await instance.cacheTxs.add(tx);
    }
  }

  async getCachedTransaction(chainId: string, txId: string) {
    const instance = await this.getBlockDBInstance(chainId);
    const data = await instance.cacheTxs.where({ txId: txId }).first();
    return data;
  }

  async clearAddressLocalData(chainId: string, address: string): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.deleteAddressData(address);
  }

  async reset(chainId: string): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.resetData();
  }

  async getProgramContent(
    chainId: string,
    programId: string,
  ): Promise<string | null> {
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
