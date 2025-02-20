import { type TxHistoryPaginationParam } from "core/types/Pagination";
import { type TokenV2 } from "core/types/Token";
import { type CoinType } from "core/types/CoinType";
import { type AleoTxType } from "core/coins/ALEO/types/History";
import { type EstimateGasExtraOption } from "core/types/NativeCoinTransaction";
import { type GasFee, type SerializeGasFee } from "core/types/GasFee";
import { type ChainSpecificReturn } from "core/types/TransactionHistory";
import { type TransactionStatus } from "core/types/TransactionStatus";

export type FilForwarderTxParams = {
  from: string;
  to: Buffer;
  value?: bigint;
};

export type InteractiveTokenParams = {
  address: string;
};

export type TokenTxHistoryParams = {
  address: string;
  token: TokenV2;
  pagination: TxHistoryPaginationParam;
};

export type TokenMetaParams = {
  contractAddress: string;
};

export type TokenEstimateGasParams<T extends CoinType> = {
  tx: {
    from: string;
    to: string;
    value: bigint;
    token: TokenV2;
    memo?: string;
    aleoTxType?: AleoTxType;
  };
  signer?: {
    publicKey?: string;
  };
  option?: EstimateGasExtraOption<T>;
};

export type TokenSendTxParams<T extends CoinType> = {
  tx: {
    from: string;
    to: string;
    value: bigint;
    token: TokenV2;
    gasFee: GasFee<T>;
    nonce?: number;
    memo?: string;
    // aleoSpecific?: AleoTxParams;
  };
  signer: { privateKey: string };
  option?: {
    RBF?: boolean;
    sendNoRBF?: boolean;
  };
};

export type TokenSendTxRes<T extends CoinType> = {
  id: string;
  from: string;
  to: string;
  value: bigint;
  gasFee: SerializeGasFee<T>;
  token: TokenV2;
  timestamp: number;
  nonce?: number;
  height?: number;
  chainSpecificReturn?: ChainSpecificReturn<T>;
};

export type TokenTransferParams = {
  from: string;
  to: string;
  tokenAddr: string;
  tokenId?: string; // for ERC721 and ERC1155
  value?: bigint; // for ERC20 and ERC1155
};

export type TokenTxDetailReq = {
  txId: string;
  token: TokenV2;
  filter: {
    address?: string;
    logIndex?: number;
  };
};

export type TokenTxDetailRes<T extends CoinType> = {
  id: string;
  from: string;
  to: string;
  nonce?: number;
  value: bigint;
  height: number;
  timestamp: number;
  fees: bigint;
  status?: TransactionStatus;

  token: TokenV2;
  confirmations?: number;
  gasFee: GasFee<T>;
  data?: string;
  memo?: string;
};
