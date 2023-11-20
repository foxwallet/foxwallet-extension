import { CoinType } from "core/types";
import {
  ServerMessage,
  type ServerPayload,
  ContentServerMethod,
} from "../../../common/types/message";
import { DisplayKeyring, DisplayWallet } from "../store/vault/types/keyring";
import { logger } from "../../../common/utils/logger";

export type PopupServerMethod = keyof IPopupServer;

export interface CreateWalletProps {
  walletName: string;
  walletId: string;
  revealMnemonic: boolean;
}

export type RegenerateWalletProps = CreateWalletProps;

export type ImportHDWalletProps = {
  walletName: string;
  walletId: string;
  mnemonic: string;
};

export interface AddAccountProps {
  walletId: string;
  coin: CoinType;
  accountId: string;
}

export interface AleoBalanceProps {
  chainId: string;
  address: string;
}

export interface AleoBalance {
  privateBalance: string;
  publicBalance: string;
  total: string;
}

export enum RecordFilter {
  UNSPENT = "unspent",
  SPENT = "spent",
  ALL = "all",
}
export interface AleoRecordsProps {
  chainId: string;
  address: string;
  programId: string;
  recordFilter: RecordFilter;
}

export interface IPopupServer {
  initPassword: (params: { password: string }) => Promise<boolean>;

  createWallet: (params: CreateWalletProps) => Promise<DisplayWallet>;

  regenerateWallet: (params: RegenerateWalletProps) => Promise<DisplayWallet>;

  importHDWallet: (params: ImportHDWalletProps) => Promise<DisplayWallet>;

  addAccount: (params: AddAccountProps) => Promise<DisplayWallet>;

  getAllWallet: () => Promise<DisplayKeyring>;

  getAleoBalance(params: AleoBalanceProps): Promise<AleoBalance>;
}

export interface IContentServer {
  connect: (params: any) => Promise<any>;
}

export async function executeServerMethod<T>(
  promise: Promise<T>,
): Promise<ServerPayload<T>> {
  try {
    return await promise
      .then((data) => ({
        error: null,
        data,
      }))
      .catch((error) => {
        logger.error("executeServerMethod error: ", error);
        return {
          error: error.message,
          data: null,
        };
      });
  } catch (err: any) {
    return {
      error: err.message,
      data: null,
    };
  }
}
