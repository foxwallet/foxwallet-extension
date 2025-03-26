import { type AxiosInstance } from "axios";
import { createRequestInstance } from "@/common/utils/request";
import {
  type MessageHistoryRes,
  type TransferHistoryRes,
  type UnconfirmedTransactionRes,
  type TransactionRes,
  type TokenHistoryRes,
  type TokenHoldingsRes,
} from "./filfox.di";
import {
  type BaseFeeItem,
  type Gas,
  type MinerApiData,
  type MinerExist,
  type MinerItem,
  type Overview,
  type MiningStats,
  type AddressData,
} from "./fil.di";
import { type NativeCurrency } from "core/types/Currency";
import {
  type TransactionHistoryItem,
  type TransactionHistoryResp,
} from "core/types/TransactionHistory";
import { BigNumber } from "ethers";
import { TransactionStatus } from "core/types/TransactionStatus";
import { type CoinType } from "core/types";
import { type NativeCoinTxDetailRes } from "core/types/NativeCoinTransaction";
import { add, mul } from "core/utils/num";
import { GasFeeType } from "core/types/GasFee";

export class FilfoxApi {
  baseUrl: string;
  reqInstance: AxiosInstance;

  constructor(url: string) {
    this.baseUrl = url;
    this.reqInstance = createRequestInstance(url);
  }

  async getUnconfirmedTransactions(
    address: string,
  ): Promise<UnconfirmedTransactionRes> {
    return this.reqInstance.get(`/message/mempool/filtered-list`, {
      params: {
        pageSize: 100,
        page: 0,
        address,
      },
    });
  }

  async getFormattedUnconfirmedTransactions(
    address: string,
    nativeCurrency: NativeCurrency,
  ): Promise<TransactionHistoryResp> {
    const res: UnconfirmedTransactionRes =
      await this.getUnconfirmedTransactions(address);
    if (res && res.totalCount > 0 && res.messages.length > 0) {
      const txs = res.messages.sort((txa, txb) => {
        return txb.nonce - txa.nonce;
      });
      const unconfirmedTxs: TransactionHistoryItem[] = txs.map((tx) => {
        return {
          id: tx.cid,
          from: tx.from,
          to: tx.to,
          value: BigNumber.from(tx.value).toBigInt(),
          timestamp: tx.createTimestamp * 1000,
          height: -1,
          decimals: nativeCurrency.decimals,
          status: TransactionStatus.PENDING,
          filSpecific: {
            method: tx.methodNumber,
            // 其他字段 filfox 暂时没给
          },
        };
      });
      return {
        txs: unconfirmedTxs,
        pagination: {
          pageNum: 0,
          pageSize: 100,
          totalCount: unconfirmedTxs.length,
          endReach: true,
        },
      };
    }
    return {
      txs: [],
      pagination: { pageNum: 0, pageSize: 100, totalCount: 0, endReach: true },
    };
  }

  async getTransferHistory(
    address: string,
    pageNum: number,
    pageSize: number,
  ): Promise<TransferHistoryRes> {
    return this.reqInstance.get(`/address/${address}/message-transfers`, {
      params: {
        page: pageNum,
        pageSize,
      },
    });
  }

  async getMessageHistory(
    address: string,
    pageNum: number,
    pageSize: number,
  ): Promise<MessageHistoryRes> {
    return this.reqInstance.get(`/address/${address}/messages`, {
      params: {
        page: pageNum,
        pageSize,
      },
    });
  }

  async getFormattedConfirmedTransactions(
    address: string,
    pageNum: number,
    pageSize: number,
    nativeCurrency: NativeCurrency,
  ): Promise<TransactionHistoryResp> {
    const history: MessageHistoryRes = await this.getMessageHistory(
      address,
      pageNum,
      pageSize,
    );

    if (history && history.totalCount > 0 && history.messages.length > 0) {
      const txs: TransactionHistoryItem[] = history.messages.map((msg) => {
        return {
          id: msg.cid,
          from: msg.from,
          to: msg.to,
          value: BigNumber.from(msg.value).toBigInt(),
          timestamp: msg.timestamp * 1000,
          height: msg.height,
          decimals: nativeCurrency.decimals,
          nonce: msg.nonce,
          status:
            msg.receipt?.exitCode === 0
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED,
        };
      });
      return {
        txs,
        pagination: {
          pageNum,
          pageSize,
          totalCount: history.totalCount,
          endReach: pageSize > txs.length,
        },
      };
    }
    return {
      txs: [],
      pagination: { pageNum, pageSize, totalCount: 0, endReach: true },
    };
  }

  async getAllTransactions(
    address: string,
    pageNum: number,
    pageSize: number,
    nativeCurrency: NativeCurrency,
  ) {
    const [unconfirmTxs, confirmTxs] = await Promise.all([
      pageNum === 0
        ? this.getFormattedUnconfirmedTransactions(address, nativeCurrency)
        : Promise.resolve({ txs: [], pagination: { totalCount: 0 } }),
      this.getFormattedConfirmedTransactions(
        address,
        pageNum ?? 0,
        pageSize,
        nativeCurrency,
      ),
    ]);

    const nonEmptyUnconfirmTxs: TransactionHistoryItem[] =
      unconfirmTxs.txs || [];
    const nonEmptyConfirmTxs: TransactionHistoryItem[] = confirmTxs.txs || [];

    const totalCount =
      (unconfirmTxs.pagination.totalCount || 0) +
      (confirmTxs.pagination.totalCount || 0);

    return {
      txs: nonEmptyUnconfirmTxs.concat(nonEmptyConfirmTxs),
      pagination: {
        pageSize,
        pageNum,
        totalCount,
        endReach: confirmTxs.pagination.endReach,
      },
    };
  }

  async getTokenTransactionHistory(
    address: string,
    contractAddress: string,
    page: number,
    pageSize: number = 50,
  ): Promise<TokenHistoryRes> {
    return await this.reqInstance.get(
      `/token/${contractAddress}/token-transfers?userAddress=${address}&pageSize=${pageSize}&page=${page}`,
    );
  }

  async getTokenHoldings(address: string): Promise<TokenHoldingsRes> {
    return await this.reqInstance.get(`/address/${address}/token-holdings`);
  }

  async getTransactionDetail(txId: string): Promise<TransactionRes> {
    return this.reqInstance.get(`/message/${txId}`);
  }

  // CoinType.FIL not ready yet
  async getFormattedTransactionDetail(
    txId: string,
  ): Promise<NativeCoinTxDetailRes<CoinType.ETH>> {
    const apiTx = await this.getTransactionDetail(txId);

    const txParams = Buffer.from(
      apiTx.params.replace("0x", ""),
      "hex",
    ).toString("base64");

    // 实际消耗的 fee 计算
    // 方法1：baseFeeBurn + overEstimationBurn + minerTip
    //           baseFeeBurn = baseFee * gasUsed
    //           minerTip = gasPremium * gasLimit
    //           overEstimationBurn 的计算比较复杂
    // 方法2：gasLimit * gasFeeCap - refund

    let fees = add(
      apiTx.fee?.baseFeeBurn ?? 0,
      apiTx.fee?.overEstimationBurn ?? 0,
      apiTx.fee?.minerTip ?? 0,
    );
    if (fees.eq(0)) {
      fees = mul(String(apiTx.gasLimit), apiTx.gasFeeCap);
      fees = fees.sub(BigNumber.from(apiTx.fee?.refund ?? 0));
    }

    // for fil, 0 is success 1 is fail
    const status = apiTx.confirmations
      ? apiTx.receipt?.exitCode
        ? TransactionStatus.FAILED
        : TransactionStatus.SUCCESS
      : TransactionStatus.PENDING;
    return {
      id: apiTx.cid,
      timestamp: apiTx.timestamp * 1000,
      value: BigNumber.from(apiTx.value).toBigInt(),
      fees: fees.toBigInt(),
      confirmations: apiTx.confirmations,
      from: apiTx.from,
      to: apiTx.to,
      height: apiTx.height,
      nonce: apiTx.nonce,
      gasFee: {
        gasLimit: apiTx.gasLimit,
        maxPriorityFeePerGas: BigNumber.from("" + apiTx.gasPremium).toBigInt(),
        maxFeePerGas: BigNumber.from(apiTx.gasFeeCap).toBigInt(),
        estimateGas: BigNumber.from(apiTx.gasFeeCap)
          .mul(apiTx.gasLimit)
          .toBigInt(),
        type: GasFeeType.EIP1559,
      },
      filSpecific: {
        version: apiTx.version,
        method: apiTx.methodNumber,
        params: txParams,
        oldTxId: apiTx.replaced ? apiTx.oldCid : undefined,
      },
      status,
    };
  }

  async getStatsMessageFee(): Promise<Gas[]> {
    return await this.reqInstance.get("/stats/message/fee");
  }

  async getBaseFeeStats(baseFeeTime: string): Promise<BaseFeeItem[]> {
    return await this.reqInstance.get(
      `/stats/base-fee?duration=${baseFeeTime}&samples=48`,
    );
  }

  async searchMinerExist(searchVal: string): Promise<MinerExist> {
    return await this.reqInstance.get(`/search?id=${searchVal}`);
  }

  async getAddressData(address: string): Promise<AddressData> {
    return await this.reqInstance.get(`/address/${address}`);
  }

  async getTopMiners(page: number, size: number): Promise<MinerItem[]> {
    const data: {
      miners: MinerItem[];
    } = await this.reqInstance.get(
      `/miner/list/power?pageSize=${size}&page=${page}`,
    );
    return data.miners;
  }

  async getOverView(): Promise<Overview> {
    return await this.reqInstance.get("/overview");
  }

  async getMiningStats(minerId: string): Promise<MiningStats> {
    return await this.reqInstance.get(
      `/address/${minerId}/mining-stats?duration=24h`,
    );
  }

  async getMinerStats(minerId: string): Promise<MinerApiData> {
    const [miningStats, overview] = await Promise.all([
      this.getMiningStats(minerId),
      this.getAddressData(minerId),
    ]);

    return {
      overview,
      miner_status: {
        qualityAdjPower: overview.miner?.qualityAdjPower,
        luckyValue: miningStats?.luckyValue,
        powerDelta: miningStats?.qualityAdjPowerDelta,
        balance: overview.balance,
        availableBalance: overview.miner?.availableBalance,
        initialPledgeRequirement: overview.miner?.initialPledgeRequirement,
        vestingFunds: overview.miner?.vestingFunds,
        miningStats,
        sectors: overview.miner?.sectors,
        totalRewards: overview.miner?.totalRewards,
        owner: overview.miner?.owner,
        worker: overview.miner?.worker,
        controlAddresses: overview.miner?.controlAddresses,
      },
    };
  }
}
