import { AleoSyncAccount } from "./AleoSyncAccount";
import { AleoAddressInfo, SyncBlockResultWithDuration } from "./SyncTask";

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
}
