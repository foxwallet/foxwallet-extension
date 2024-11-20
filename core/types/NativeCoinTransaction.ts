import { type CoinType } from "core/types/CoinType";
import { type GasFee, type SerializeGasFee } from "core/types/GasFee";
import { type BytesLike } from "ethers";

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
  // chainSpecificReturn?: ChainSpecificReturn<T>;
};
