import { type CoinType } from "core/types/CoinType";

export type GasFeeEIP1559<S extends boolean = false> = {
  gasLimit: number;
  maxPriorityFeePerGas: S extends true ? string : bigint;
  maxFeePerGas: S extends true ? string : bigint;
  estimateGas: S extends true ? string : bigint;
  type: GasFeeType.EIP1559;
};

export type GasFeeLegacy<S extends boolean = false> = {
  gasLimit: number;
  gasPrice: S extends true ? string : bigint;
  estimateGas: S extends true ? string : bigint;
  type: GasFeeType.LEGACY;
};

export type GasFeeUTXO<S extends boolean = false> = {
  estimateGas: S extends true ? string : bigint;
  feeRate?: number;
  fee?: S extends true ? string : bigint;
  priorityFee?: S extends true ? string : bigint;
  utxosHash?: string[];
  type: GasFeeType.UTXO;
};

export interface AleoGasFee {
  baseFee: bigint;
  priorityFee: bigint;
}

export enum GasFeeType {
  LEGACY = 0,
  EIP1559 = 1,
  CUSTOM = 2, // never used
  UTXO = 3,
  QTUM_DAPP = 4,
  COSMOS = 5,
  TRON_RESOURCE = 6,
}

export type GasFee<
  T extends CoinType,
  S extends boolean = false,
> = T extends CoinType.ETH
  ? GasFeeEIP1559<S> | GasFeeLegacy<S>
  : T extends CoinType.ALEO
  ? GasFeeUTXO<S>
  : never;

export type SerializeGasFee<T extends CoinType> = GasFee<T, true>;

export type FeeDataEIP1559<S extends boolean = false> = {
  maxPriorityFeePerGas: S extends true ? string : bigint;
  maxFeePerGas: S extends true ? string : bigint;
  eip1559: true;
};

export type FeeDataLegacy<S extends boolean = false> = {
  gasPrice: S extends true ? string : bigint;
  eip1559: false;
};

export type FeeData<G extends GasFeeType> = G extends GasFeeType.EIP1559
  ? FeeDataEIP1559<false>
  : FeeDataLegacy<false>;

type GasGradeUTXO = {
  feeRate: number;
};

type GasGradeEIP1559 = {
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
};

type GasGradeLegacy = {
  gasPrice: number;
};

type GasGradeCosmos = {};

export type GasGradeDataItem<GFT extends GasFeeType> = {
  label: string;
} & (GFT extends GasFeeType.UTXO
  ? GasGradeUTXO
  : GFT extends GasFeeType.LEGACY
  ? GasGradeLegacy
  : GFT extends GasFeeType.EIP1559
  ? GasGradeEIP1559
  : GFT extends GasFeeType.COSMOS
  ? GasGradeCosmos
  : never);

export enum GasGrade {
  Fast = "fast",
  Middle = "middle",
  Slow = "slow",
}

export type GasGradeData<GFT extends GasFeeType> = {
  [GasGrade.Fast]: GasGradeDataItem<GFT>;
  [GasGrade.Middle]: GasGradeDataItem<GFT>;
  [GasGrade.Slow]: GasGradeDataItem<GFT>;
};
