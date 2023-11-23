import { CoinType } from "core/types";
import {
  ServerMessage,
  type ServerPayload,
  ContentServerMethod,
} from "../../../common/types/message";
import { DisplayKeyring, DisplayWallet } from "../store/vault/types/keyring";
import { logger } from "../../../common/utils/logger";
import { ChainUniqueId } from "core/types/ChainUniqueId";

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

export interface GetBalanceProps {
  uniqueId: ChainUniqueId;
  address: string;
}

// export enum SerializeType {
//   BIG_INT = "big_int",
// }

// export interface SerializeValue {
//   type: SerializeType;
//   value: string;
// }

// export interface GetBalanceResp {
//   privateBalance: SerializeValue;
//   publicBalance: SerializeValue;
//   total: SerializeValue;
// }

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

// interface PopupClientEventListeners {
//   lock: () => void;
// }

// export type PopupClientEvent = keyof PopupClientEventListeners;

// type PopupClientListenerMap = {
//   [T in PopupClientEvent]: PopupClientEventListeners[T][];
// };

export interface IPopupServer {
  initPassword: (params: { password: string }) => Promise<boolean>;

  hasAuth(): Promise<boolean>;

  login(params: { password: string }): Promise<boolean>;

  lock(): Promise<void>;

  timeoutLock(): Promise<void>;

  createWallet: (params: CreateWalletProps) => Promise<DisplayWallet>;

  regenerateWallet: (params: RegenerateWalletProps) => Promise<DisplayWallet>;

  importHDWallet: (params: ImportHDWalletProps) => Promise<DisplayWallet>;

  addAccount: (params: AddAccountProps) => Promise<DisplayWallet>;

  getAllWallet: () => Promise<DisplayKeyring>;

  // getBalance(params: GetBalanceProps): Promise<GetBalanceResp>;
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
