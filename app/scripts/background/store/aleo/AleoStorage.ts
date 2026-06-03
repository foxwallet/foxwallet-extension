import { aleoAccountStorageInstance } from "@/common/utils/indexeddb";
import {
  type ClearAddressLocalDataOptions,
  type IAleoStorage,
} from "core/coins/ALEO/types/IAleoStorage";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import { ProverKeyPair } from "core/coins/ALEO/types/ProverKeyPair";
import {
  type AleoLocalTxInfo,
  type AleoTransaction,
} from "core/coins/ALEO/types/Transaction";
import { ALEO_CHAIN_IDS } from "core/coins/ALEO/config/chains";
import { getBlockDatabaseByChainId } from "@/database/AleoBlockDatabase";
import { AleoOnChainHistoryItem } from "core/coins/ALEO/types/History";
import { scannerDB } from "@/database/ScannerDatabase";
import {
  type ScannerDecryptedRecord,
  type ScannerDecryptedRecordMap,
} from "core/coins/ALEO/types/ScannerDecryptedRecord";

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

  async getScannerDBInstance() {
    if (!scannerDB.isOpen()) {
      await scannerDB.open();
    }
    return scannerDB;
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
    for (let chainId of ALEO_CHAIN_IDS) {
      await this.clearAddressLocalData(chainId, address, {
        scannerCacheCleanup: "strict",
      });
    }
    await instance.removeItem(address);
    return true;
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

  /**
   * txDetailCache: full transaction body (transitions + inputs/outputs) keyed
   * by txId. Populated lazily by AleoService.getCachedTxDetail and consumed
   * by the private-transfer amount resolver. We never invalidate entries: an
   * Aleo confirmed tx is immutable once finalized.
   */
  async getCachedTxDetail(
    chainId: string,
    txId: string,
  ): Promise<AleoTransaction | undefined> {
    const instance = await this.getBlockDBInstance(chainId);
    const row = await instance.txDetailCache.where({ txId }).first();
    return row?.tx;
  }

  async setCachedTxDetail(
    chainId: string,
    txId: string,
    tx: AleoTransaction,
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.txDetailCache.put({
      txId,
      tx,
      cachedAt: Date.now(),
    });
  }

  async clearAddressLocalData(
    chainId: string,
    address: string,
    options: ClearAddressLocalDataOptions = {},
  ): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.deleteAddressData(address);

    if (options.scannerCacheCleanup === "strict") {
      await this.clearScannerDecryptedRecords(chainId, address);
      return;
    }
    try {
      await this.clearScannerDecryptedRecords(chainId, address);
    } catch (error) {
      console.error("[AleoStorage] failed to clear scanner decrypted cache", {
        chainId,
        address,
        error,
      });
    }
  }

  async reset(chainId: string): Promise<void> {
    const instance = await this.getBlockDBInstance(chainId);
    await instance.resetData();
    try {
      const scannerInstance = await this.getScannerDBInstance();
      await scannerInstance.deleteChainData(chainId);
    } catch (error) {
      console.error(
        "[AleoStorage] failed to clear scanner decrypted cache on chain reset",
        { chainId, error },
      );
    }
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

  async getScannerDecryptedRecords(
    chainId: string,
    address: string,
    tags: string[],
  ): Promise<ScannerDecryptedRecordMap> {
    const instance = await this.getScannerDBInstance();
    return await instance.getDecryptedRecords(chainId, address, tags);
  }

  async setScannerDecryptedRecords(
    chainId: string,
    address: string,
    records: ScannerDecryptedRecord[],
  ): Promise<void> {
    const instance = await this.getScannerDBInstance();
    await instance.putDecryptedRecords(chainId, address, records);
  }

  async clearScannerDecryptedRecords(
    chainId: string,
    address: string,
  ): Promise<void> {
    const instance = await this.getScannerDBInstance();
    await instance.deleteAddressData(chainId, address);
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
