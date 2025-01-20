import {
  type BalanceResp,
  type NativeBalanceRes,
  type TokenBalanceParams,
} from "core/types/Balance";
import { type CoinType } from "core/types";
import {
  type AuthParams,
  type EstimateGasParam,
  type NativeCoinSendTxParams,
  type NativeCoinSendTxRes,
  type NativeCoinTxHistoryParams,
} from "core/types/NativeCoinTransaction";
import {
  type FeeDataEIP1559,
  type FeeDataLegacy,
  type GasFee,
  type GasFeeType,
  type GasGradeData,
} from "core/types/GasFee";
import type { TransactionHistoryResp } from "core/types/TransactionHistory";
import { type TokenMetaV2, type TokenV2 } from "core/types/Token";
import {
  type TokenTxHistoryParams,
  type TokenMetaParams,
  type TokenEstimateGasParams,
  type TokenSendTxParams,
  type TokenSendTxRes,
  type InteractiveTokenParams,
} from "core/types/TokenTransaction";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { simpleConcatUrl } from "@/common/utils/url";
import { type RecordFilter } from "@/scripts/background/servers/IWalletServer";
import type { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";

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

  supportSendMaxNative(): boolean {
    return false;
  }

  // optional
  validateAddress(_address: string): boolean {
    console.error(
      "validateAddress not implemented for " + this.baseConfig.chainName,
    );
    return true;
  }

  supportNativeCoinTxHistory(): boolean {
    return false;
  }

  async getNativeCoinTxHistory(
    _params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    console.error(
      "getNativeCoinTxHistory not implemented for " + this.baseConfig.chainName,
    );
    return {
      txs: [],
      pagination: {
        pageSize: 0,
        pageNum: 0,
        totalCount: 0,
        endReach: true,
      },
    };
  }

  supportToken(): boolean {
    return false;
  }

  async getTokenBalance(
    params: TokenBalanceParams,
  ): Promise<BalanceResp | undefined> {
    console.error(
      "getTokenBalance not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  async getTokenMeta(
    _params: TokenMetaParams,
  ): Promise<TokenMetaV2 | undefined> {
    console.error(
      "getTokenMeta not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  supportTokenTxHistory(): boolean {
    return false;
  }

  async getTokenTxHistory(
    _params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp | undefined> {
    console.error(
      "getTokenTxHistory not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  async getTokenEstimateGasFee(
    _params: TokenEstimateGasParams<CoinType>,
  ): Promise<GasFee<CoinType> | undefined> {
    console.error(
      "getTokenEstimateGasFee not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  async sendToken(
    _params: TokenSendTxParams<CoinType>,
  ): Promise<TokenSendTxRes<CoinType> | undefined> {
    console.error("sendToken not implemented for " + this.baseConfig.chainName);
    return undefined;
  }

  supportUserInteractiveToken(): boolean {
    return false;
  }

  async getUserInteractiveTokens(
    _params: InteractiveTokenParams,
    _auth?: AuthParams,
  ): Promise<TokenV2[]> {
    console.error(
      "getUserInteractiveTokens not implemented for " +
        this.baseConfig.chainName,
    );
    return [];
  }

  gasUnit(): string {
    return "";
  }

  getTxDetailUrl(txId: string, lang?: ExplorerLanguages): string | undefined {
    if (!this.baseConfig.explorerUrls || !this.baseConfig.explorerPaths?.tx) {
      return undefined;
    }
    const baseUrl =
      this.baseConfig.explorerUrls[lang ?? ExplorerLanguages.EN] ??
      this.baseConfig.explorerUrls[ExplorerLanguages.EN];
    const path = this.baseConfig.explorerPaths.tx.replace("{txid}", txId);
    return simpleConcatUrl(baseUrl, path);
  }

  supportFeeData(): boolean {
    return false;
  }

  async getFeeData(): Promise<
    FeeDataLegacy<false> | FeeDataEIP1559<false> | undefined
  > {
    console.error(
      "getFeeData not implemented for " + this.baseConfig.chainName,
    );
    return undefined;
  }

  async getRecords(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
    withRecordName?: boolean,
  ): Promise<RecordDetailWithSpent[]> {
    console.error(
      "getRecords not implemented for " + this.baseConfig.chainName,
    );
    return [];
  }
}
