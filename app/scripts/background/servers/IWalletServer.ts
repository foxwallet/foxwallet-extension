import { CoinType } from "core/types";
import { type ServerPayload } from "../../../common/types/message";
import {
  DisplayComposedAccount,
  DisplayKeyring,
  DisplayWallet,
  OneMatchGroupAccount,
} from "../store/vault/types/keyring";
import { logger } from "../../../common/utils/logger";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoSendTxParams } from "core/coins/ALEO/types/Transaction";
import { CustomRecord } from "core/coins/ALEO/types/Record";
import {
  AleoDeployment,
  AleoRequestDeploymentParams,
} from "core/coins/ALEO/types/Deployment";
import { SiteInfo } from "@/scripts/content/host";
import { AccountOption, ImportPrivateKeyTypeMap } from "core/types/CoinBasic";
import { DecryptPermission } from "@/database/types/dapp";
import {ProviderError, SerializableError} from "@/scripts/content/ErrorCode";

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
  accountId: string;
}

export interface ImportPrivateKeyProps<T extends CoinType> {
  walletId: string;
  walletName: string;
  coinType: T;
  privateKey: string;
  privateKeyType: ImportPrivateKeyTypeMap[T];
  option: AccountOption[T];
}

export interface GetSelectedAccountProps {}

export interface SetSelectedAccountProps {
  groupAccount: OneMatchGroupAccount;
}

export interface GetBalanceProps {
  uniqueId: ChainUniqueId;
  address: string;
}

export interface GetSelectedUniqueIdProps {
  coinType: CoinType;
}

export interface SetSelectedUniqueIdProps {
  uniqueId: ChainUniqueId;
}

export interface ResyncAleoProps {
  uniqueId: ChainUniqueId;
  account: DisplayComposedAccount;
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

export type AleoSendTxProps = Omit<AleoSendTxParams, "privateKey"> & {
  walletId: string;
  uniqueId: ChainUniqueId;
  coinType: CoinType;
  accountId: string;
};

export type AleoRequestTxProps = Omit<AleoSendTxParams, "privateKey"> & {
  coinType: CoinType;
  uniqueId: ChainUniqueId;
};

export type AleoRequestDeploymentProps = Omit<
  AleoRequestDeploymentParams,
  "privateKey"
> & {
  coinType: CoinType;
  uniqueId: ChainUniqueId;
};

export type PopupSignMessageProps = {
  walletId: string;
  coinType: CoinType;
  accountId: string;
  message: string;
};

export type GetPrivateKeyProps = {
  walletId: string;
  coinType: CoinType;
  accountId: string;
};

export type ChangeAccountStateProps = {
  walletId: string;
  accountId: string;
};

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

  importPrivateKey<T extends CoinType>(
    params: ImportPrivateKeyProps<T>,
  ): Promise<DisplayWallet>;

  getHDWallet(walletId: string): Promise<DisplayWallet>;

  getSimpleWallet(walletId: string): Promise<DisplayWallet>;

  getAllWallet: () => Promise<DisplayKeyring>;

  rescanAleo(): Promise<boolean>;

  sendAleoTransaction(params: AleoSendTxProps): Promise<void>;

  isSendingAleoTransaction(): Promise<boolean>;

  signMessage(params: PopupSignMessageProps): Promise<string>;

  onRequestFinish(params: RequestFinfishProps): Promise<void>;

  getHDMnemonic(walletId: string): Promise<string>;

  deleteWallet(walletId: string): Promise<DisplayKeyring>;

  getPrivateKey(params: GetPrivateKeyProps): Promise<string>;

  checkPassword(password: string): Promise<boolean>;

  getSelectedGroupAccount(
    params?: GetSelectedAccountProps,
  ): Promise<OneMatchGroupAccount | null>;

  setSelectedGroupAccount({
    groupAccount,
  }: SetSelectedAccountProps): Promise<OneMatchGroupAccount>;
}

export interface ALEOConnectProps {
  decryptPermission: DecryptPermission;
  network: string;
  programs?: string[];
}

export interface ConnectProps {
  coinType: CoinType;
  network?: string;
  chainId?: string;
}

export interface DecrtptProps {
  cipherText: string;
  tpk?: string;
  programId?: string;
  functionName?: string;
  index?: number;
}

export interface RequestRecordsProps {
  program: string;
  filter?: RecordFilter;
}

export interface RequestRecordBody {
  id: string;
  owner: string;
  program_id: string;
  spent: boolean;
  data: CustomRecord;
  recordName: string;
}

export type RequestRecordPlaintextBody = RequestRecordBody & {
  plaintext: string;
};

export interface RequestRecordsResp {
  records: RequestRecordBody[];
}

export type RequestRecordsPlaintextResp = {
  records: RequestRecordPlaintextBody[];
};

export type InputItem =
  | string
  | {
      id: string;
      owner: string;
      program_id: string;
      spent: boolean;
      data: object;
    };

export interface TransitionParam {
  program: string;
  functionName: string;
  inputs: InputItem[];
}

export interface TransactionParam {
  address: string;
  chainId: string;
  transitions: TransitionParam[];
  fee: number;
  feePrivate: boolean;
}

export interface RequestTxProps {
  transaction: TransactionParam;
}
export interface RequestTxResp {
  transactionId: string;
}

export interface SignMessageProps {
  message: string;
  method?: string;
}

export interface SignMessageResp {
  signature: string;
}

export interface RequestBulkTxsProps {
  transactions: TransactionParam[];
}

export interface RequestBulkTxsResp {
  transactionIds: string[];
}

export interface RequestDeployProps {
  deployment: AleoDeployment;
}

export interface RequestDeployResp {
  transactionId: string;
}

export interface TransactionStatusProps {
  transactionId: string;
}

export interface TransactionStatusResp {
  status: string;
}

export enum TxOrder {
  ASC = "asc",
  DESC = "desc",
}

export interface RequestTxHistoryProps {
  program: string;
  order?: TxOrder;
}

export interface TxHistoryBody {
  id: string;
  transactionId: string;
}

export interface RequestTxHistoryResp {
  transactions: TxHistoryBody[];
}

export interface RequestFinfishProps {
  requestId: string;
  error?: string;
  data?: any;
}

export interface SiteMetadata {
  siteInfo: SiteInfo;
  network: string | null;
  address: string | null;
}

export type ServerMethodContext = {
  coinType: CoinType;
  siteMetadata?: SiteMetadata;
};

export type ETHSignPersonalMessageResult = {};

export interface IALEOContentServer {
  connect: (
    params: ALEOConnectProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<string | null>;
  disconnect: (
    params: {},
    serverMethodContext: ServerMethodContext,
  ) => Promise<boolean>;
  decrypt: (
    params: DecrtptProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<string>;
  requestRecords: (
    params: RequestRecordsProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestRecordsResp>;
  requestRecordPlaintexts: (
    params: RequestRecordsProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestRecordsPlaintextResp>;
  requestTransaction: (
    params: RequestTxProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestTxResp>;
  signMessage: (
    params: SignMessageProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<SignMessageResp>;
  requestExecution: (
    params: RequestTxProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestTxResp>;
  requestBulkTransactions: (
    params: RequestBulkTxsProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestBulkTxsResp>;
  requestDeploy: (
    params: RequestDeployProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestDeployResp>;
  transactionStatus: (
    params: TransactionStatusProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<TransactionStatusResp>;
  getExecution: (
    params: TransactionStatusProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<TransactionStatusResp>;
  requestTransactionHistory: (
    params: RequestTxHistoryProps,
    serverMethodContext: ServerMethodContext,
  ) => Promise<RequestTxHistoryResp>;
}

export type ETHRequestParams<T> = {
  id?: string;
  method: string;
  params: T;
};

export type ETHSignPersonalMessageParams = {
  data: string;
};

export interface IETHContentServer {
  eth_accounts: (
    payload: ETHRequestParams<{}>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<string[]>;
  eth_requestAccounts: (
    payload: ETHRequestParams<{}>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<string[]>;
  // net_version: (
  //   payload: ETHRequestParams<{}>,
  //   serverMethodContext: ServerMethodContext,
  // ) => Promise<string>;
  // eth_chainId: (
  //   payload: ETHRequestParams<{}>,
  //   serverMethodContext: ServerMethodContext,
  // ) => Promise<string>;
  wallet_getPermissions: (
    payload: ETHRequestParams<{}>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  wallet_requestPermissions: (
    payload: ETHRequestParams<[{ eth_accounts: {} }]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  wallet_revokePermissions: (
    payload: ETHRequestParams<[{ eth_accounts: {} }]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  personal_sign: (
    payload: ETHRequestParams<[string, string]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  personal_ecRecover: (
    payload: ETHRequestParams<[string, string]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  eth_signTypedData_v3: (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  eth_signTypedData_v4: (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  eth_signTypedData: (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  eth_sendTransaction: (
    payload: ETHRequestParams<[any]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  wallet_watchAsset: (
    payload: ETHRequestParams<any>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  wallet_addEthereumChain: (
    payload: ETHRequestParams<any>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  wallet_switchEthereumChain: (
    payload: ETHRequestParams<[{ chainId: string }]>,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  _setGlobalChainId: (
    payload: string,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  _getGlobalChainId: (
    payload: any,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
  proxyRPCCall: (
    payload: any,
    serverMethodContext: ServerMethodContext,
  ) => Promise<any>;
}

export type IContentServer<T extends CoinType> = T extends CoinType.ALEO
  ? IALEOContentServer
  : T extends CoinType.ETH
  ? IETHContentServer
  : never;

export type ContentServerMethod<T extends CoinType> = T extends CoinType.ALEO
  ? keyof IALEOContentServer
  : T extends CoinType.ETH
  ? keyof IETHContentServer
  : never;

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
        if (
          error instanceof ProviderError ||
          error instanceof SerializableError
        ) {
          return {
            error: error,
            data: null,
          };
        } else {
          return {
            error: new SerializableError(error?.message ?? error),
            data: null,
          };
        }
      });
  } catch (err: any) {
    return {
      error: new SerializableError(err?.message ?? err),
      data: null,
    };
  }
}
