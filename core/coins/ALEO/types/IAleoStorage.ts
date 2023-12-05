import { AleoSyncAccount } from "./AleoSyncAccount";
import { AleoAddressInfo, SyncBlockResultWithDuration } from "./SyncTask";
import { AleoLocalTxInfo } from "./Tranaction";

export interface IAleoStorage {
  getAccountsAddress(chainId: string): Promise<string[]>;
  getAccountInfo(
    chainId: string,
    address: string,
  ): Promise<AleoSyncAccount | undefined>;

  setAccountInfo(
    chainId: string,
    account: AleoSyncAccount,
  ): Promise<AleoSyncAccount>;

  getAleoBlockRanges(chainId: string, address: string): Promise<string[]>;
  setAleoBlocks(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncBlockResultWithDuration,
  ): Promise<SyncBlockResultWithDuration>;

  getAleoBlockInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncBlockResultWithDuration | null>;

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

  getAddressLocalTxIds(chainId: string, address: string): Promise<string[]>;

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

  getProgramContent(chainId: string, programId: string): Promise<string | null>;

  setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void>;
}
