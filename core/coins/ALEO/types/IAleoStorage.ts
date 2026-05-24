import { type AleoSyncAccount } from "./AleoSyncAccount";
import { type AleoOnChainHistoryItem } from "./History";
import {
  type ScannerDecryptedRecord,
  type ScannerDecryptedRecordMap,
} from "./ScannerDecryptedRecord";
import { type AleoLocalTxInfo } from "./Transaction";

export interface ClearAddressLocalDataOptions {
  scannerCacheCleanup?: "best-effort" | "strict";
}

export interface IAleoStorage {
  getAccountsAddress(): Promise<string[]>;
  getAccountInfo(address: string): Promise<AleoSyncAccount | undefined>;

  setAccountInfo(account: AleoSyncAccount): Promise<AleoSyncAccount>;

  setLocalTxNotification(chainId: string, localId: string): Promise<void>;

  setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void>;

  getAddressLocalTxs(
    chainId: string,
    address: string,
  ): Promise<AleoLocalTxInfo[]>;

  getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null>;

  removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void>;

  clearAddressLocalData(
    chainId: string,
    address: string,
    options?: ClearAddressLocalDataOptions,
  ): Promise<void>;

  reset(chainId: string): Promise<void>;

  cacheTransaction(chainId: string, tx: AleoOnChainHistoryItem): Promise<void>;

  getCachedTransaction(
    chainId: string,
    txId: string,
  ): Promise<AleoOnChainHistoryItem | undefined>;

  getProgramContent(chainId: string, programId: string): Promise<string | null>;

  setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void>;

  getScannerDecryptedRecords(
    chainId: string,
    address: string,
    tags: string[],
  ): Promise<ScannerDecryptedRecordMap>;

  setScannerDecryptedRecords(
    chainId: string,
    address: string,
    records: ScannerDecryptedRecord[],
  ): Promise<void>;

  clearScannerDecryptedRecords(chainId: string, address: string): Promise<void>;
}
