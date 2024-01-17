import { AleoSyncAccount } from "./AleoSyncAccount";
import { AleoAddressInfo, SyncRecordResultWithDuration } from "./SyncTask";
import { AleoLocalTxInfo } from "./Transaction";

export interface IAleoStorage {
  getAccountsAddress(): Promise<string[]>;
  getAccountInfo(address: string): Promise<AleoSyncAccount | undefined>;

  setAccountInfo(account: AleoSyncAccount): Promise<AleoSyncAccount>;

  getAleoRecordRanges(chainId: string, address: string): Promise<string[]>;
  getAleoRecords(
    chainId: string,
    address: string,
  ): Promise<SyncRecordResultWithDuration[]>;
  setAleoRecords(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncRecordResultWithDuration,
  ): Promise<SyncRecordResultWithDuration>;

  getAleoRecordsInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncRecordResultWithDuration | null>;

  getAddressInfo(
    chainId: string,
    address: string,
  ): Promise<AleoAddressInfo | null>;

  setAddressInfo(
    chainId: string,
    address: string,
    info: AleoAddressInfo,
  ): Promise<AleoAddressInfo>;

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

  clearAddressLocalData(chainId: string, address: string): Promise<void>;

  getProgramContent(chainId: string, programId: string): Promise<string | null>;

  setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void>;
}
