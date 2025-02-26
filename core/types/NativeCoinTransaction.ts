import { type CoinType } from "core/types/CoinType";
import { type GasFee, type SerializeGasFee } from "core/types/GasFee";
import { type BytesLike } from "ethers";
import { type TxHistoryPaginationParam } from "core/types/Pagination";
import {
  type FilSpecificTxParam,
  type TxLabel,
  type ChainSpecificReturn,
} from "core/types/TransactionHistory";
import { type TransactionStatus } from "core/types/TransactionStatus";
import { type AleoTxStatus } from "core/coins/ALEO/types/Transaction";

export type AuthParams = {
  [key: string]: string;
};

type GasTypeOptions<T extends CoinType> = Partial<
  Omit<GasFee<T>, "estimateGas">
>;

export type EstimateGasExtraOption<T extends CoinType> = {
  sendMax?: boolean;
  RBF?: boolean;
  sendNoRBF?: boolean;
} & GasTypeOptions<T>;

export type EstimateGasParam<T extends CoinType> = {
  tx: {
    from: string;
    to?: string;
    memo?: string;
    value: bigint;
    data?: BytesLike;
    // filSpecific?: FilSpecificTxParam;
    // aleoTxType?: AleoTxType;
    // aleoProgramId?: InnerProgramId;
    oldTx?: string; // raw btc/qtum tx
  };
  signer?: {
    publicKey?: string;
  };
  option?: EstimateGasExtraOption<T>;
  auth?: AuthParams;
};

export type NativeCoinSendTxParams<T extends CoinType> = {
  tx: {
    from: string;
    to: string;
    value: bigint;
    gasFee: GasFee<T>;
    nonce?: number;
    data?: string;
    // filSpecific?: FilSpecificTxParam;
    memo?: string;
    // aleoSpecific?: AleoTxParams;
    oldTx?: string; // raw btc/qtum tx
  };
  signer: { privateKey: string };
  option?: {
    RBF?: boolean;
    sendNoRBF?: boolean;
    sendMax?: boolean;
  };
  // auth?: AuthParams;
};

export type NativeCoinSendTxRes<T extends CoinType> = {
  id: string;
  from: string;
  to: string;
  value: bigint;
  gasFee: SerializeGasFee<T>;
  timestamp: number;
  data?: string;
  rawTx?: string;
  memo?: string;
  nonce?: number;
  height?: number;
  chainSpecificReturn?: ChainSpecificReturn<T>;
};

export type NativeCoinTxDetailParams = {
  txId: string;
  filter: {
    address?: string;
    addressType?: "sender" | "receiver";
  };
  auth?: { [key: string]: string };
};

export type TokenTransferLogInfo = {
  token: string;
  from: string;
  to: string;
  value: bigint;
  tokenId?: bigint;
};

export type NativeCoinTxDetailRes<T extends CoinType> = {
  id: string;
  from: string;
  to: string;
  value: bigint;
  height: number;
  timestamp: number;
  fees: bigint;
  gasFee: GasFee<T>;
  nonce?: number;
  tokenTransfers?: TokenTransferLogInfo[];
  status?: TransactionStatus;
  label?: TxLabel;

  confirmations?: number;
  data?: string;
  rawTx?: string;
  filSpecific?: FilSpecificTxParam;
  memo?: string;
  // qrc20TokenTransfers?: QRC20Transfer[];
  inMessageId?: string;
};

export type NativeCoinTxHistoryParams = {
  address: string;
  pagination: TxHistoryPaginationParam;
  auth?: { [key: string]: string };
};

export enum SpecificHeightValue {
  UNCONFIRM = -1,
  CONFIRM_WITHOUT_HEIGHT = -2,
  FAILED = -3,
}

export type CoinTxHistoryParams = {
  address: string;
  pagination: TxHistoryPaginationParam;
  auth?: { [key: string]: string };
};

export type CoinTxDetailParams = {
  txId: string;
  filter: {
    address?: string;
    addressType?: "sender" | "receiver";
  };
  auth?: { [key: string]: string };
};

export type CoinTxDetailRes<T extends CoinType> = {
  id: string;
  from: string;
  to: string;
  value: bigint;
  height: number;
  timestamp: number;
  fees: bigint;
  gasFee: GasFee<T>;
  nonce?: number;
  tokenTransfers?: TokenTransferLogInfo[];
  status?: TransactionStatus;
  label?: TxLabel;

  confirmations?: number;
  data?: string;
  rawTx?: string;
  filSpecific?: FilSpecificTxParam;
  memo?: string;
  // qrc20TokenTransfers?: QRC20Transfer[];
  inMessageId?: string;
};

export type TransactionStatusInfo = {
  fee: bigint;
  height: number;
  timestamp: number;
  confirmations: number;
  call: string | undefined;
  status: TransactionStatus;
  from?: string;
  to?: string;
  value?: bigint;
  chainSpecific: {
    aleoStatus: AleoTxStatus;
  };
};
