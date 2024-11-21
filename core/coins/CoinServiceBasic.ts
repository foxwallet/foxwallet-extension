import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type NativeBalanceRes } from "core/types/Balance";
import { type CoinType } from "core/types";
import {
  type EstimateGasParam,
  type NativeCoinSendTxParams,
  type NativeCoinSendTxRes,
} from "core/types/NativeCoinTransaction";
import {
  type GasFee,
  type GasFeeType,
  type GasGradeData,
} from "core/types/GasFee";

export abstract class CoinServiceBasic {
  baseConfig: ChainBaseConfig;

  protected constructor(config: ChainBaseConfig) {
    this.baseConfig = config;
  }

  abstract getBalance(_address: string): Promise<NativeBalanceRes>;

  supportCustomGasFee(): boolean {
    return false;
  }

  async estimateGasFee(
    _params: EstimateGasParam<CoinType>,
  ): Promise<GasFee<CoinType> | undefined> {
    console.error(
      "estimateGasFee not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  supportNonce(): boolean {
    return false;
  }

  async getNonce(_param: {
    address: string;
    nonceTag?: string | undefined;
  }): Promise<number> {
    console.error("getNonce not implemented for " + this.baseConfig.chainName);
    return 0;
  }

  async sendNativeCoin(
    _params: NativeCoinSendTxParams<CoinType>,
  ): Promise<NativeCoinSendTxRes<CoinType> | undefined> {
    throw new Error(
      "sendNativeCoin not implemented for " + this.baseConfig.chainName,
    );
  }

  supportGasGrade(): boolean {
    return false;
  }

  async getGasGradeData(): Promise<GasGradeData<GasFeeType> | undefined> {
    console.error(
      "getGasGradeData not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }
}
