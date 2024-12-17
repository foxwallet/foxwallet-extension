import {
  type NextPageParams,
  type TokenBalanceResp,
  type TokenBalanceV2,
  type TokenTransferResp,
  type TransactionResp,
} from "./blockscoutV2.di";
import { createRequestInstance } from "@/common/utils/request";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type AxiosInstance } from "axios";
import {
  SpecificHeightValue,
  type NativeCoinTxHistoryParams,
} from "core/types/NativeCoinTransaction";
import {
  type TransactionHistoryItem,
  type TransactionHistoryResp,
} from "core/types/TransactionHistory";
import { TransactionStatus } from "core/types/TransactionStatus";
import { getTxLabelEVM, toChecksumAddress } from "../../utils";
import { BigNumber } from "ethers";
import {
  type TokenTxHistoryParams,
  type InteractiveTokenParams,
} from "core/types/TokenTransaction";
import { AssetType, type TokenV2 } from "core/types/Token";
import sleep from "sleep-promise";
import camelcaseKeys from "camelcase-keys";

const maxLoop = 10;

export class BlockscoutApiV2 {
  reqInstance: AxiosInstance;
  uniqueId: ChainUniqueId;

  constructor(url: string, uniqueId: ChainUniqueId) {
    this.reqInstance = createRequestInstance(url, 15000);
    this.uniqueId = uniqueId;
  }

  nextPageParamsToCursor(
    params: NextPageParams | undefined,
  ): string | undefined {
    if (params?.index && params.index !== "undefined") {
      return `block_number=${params.blockNumber}&index=${params.index}&items_count=${params.itemsCount}`;
    }
    return undefined;
  }

  async getTransactionHistory(
    address: string,
    pageNum: number,
    pageSize: number,
    lastCursor?: string,
  ): Promise<TransactionHistoryResp> {
    const snakeRes = await this.reqInstance.get(
      `/addresses/${address}/transactions?${lastCursor}`,
    );
    // @ts-expect-error camelcaseKeys type
    const res: TransactionResp = camelcaseKeys(snakeRes, {
      deep: true,
    });
    if (res.message !== undefined && !res.items && !res.nextPageParams) {
      throw new Error(res.message);
    }
    const { items: transactions, nextPageParams } = res;
    const cursor = this.nextPageParamsToCursor(nextPageParams);

    if (!transactions) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, endReach: true },
      };
    }
    return {
      txs: transactions.map((item) => {
        const {
          hash,
          from,
          to,
          nonce, // bn
          value, // bn
          confirmations, // bn
          timestamp, // "2023-11-23T09:17:35.000000Z" 必须转成 1671053471
          block,
          status, // "ok" | "error"
          rawInput,
        } = item;

        const dateObject = new Date(timestamp ?? 0);
        const newTimestamp = dateObject.getTime();
        const fromAddress = from?.hash;
        const toAddress = to?.hash;
        const transactionStatus = confirmations
          ? status === "ok"
            ? TransactionStatus.SUCCESS
            : TransactionStatus.FAILED
          : TransactionStatus.PENDING;
        const toAddr = toChecksumAddress(toAddress);
        const data = rawInput ?? "0x";
        return {
          id: hash,
          from: toChecksumAddress(fromAddress),
          to: toAddr,
          nonce: Number(nonce),
          data,
          value: BigNumber.from(value).toBigInt(),
          confirmations: Number(confirmations),
          timestamp: newTimestamp,
          height: Number(block),
          status: transactionStatus,
          label: getTxLabelEVM(data, toAddr),
        };
      }),
      pagination: {
        pageNum,
        pageSize,
        endReach: !cursor,
        cursor,
      },
    };
  }

  async queryUserInteractiveTokens(address: string): Promise<TokenV2[]> {
    let nextPageParams: string | undefined = "";
    let tokenBalances: TokenBalanceV2[] = [];
    let loop = 0;
    do {
      let snakeRes = {};
      try {
        snakeRes = await this.reqInstance.get(
          `/addresses/${address}/tokens?type=ERC-20&${nextPageParams}`, // 只需要 ERC-20
        );
      } catch (e) {
        const msg = (e as Error).message;
        if (
          msg !== "No tokens found" &&
          msg !== "Request failed with status code 404"
        ) {
          throw e;
        }
      }
      const res: TokenBalanceResp = camelcaseKeys(snakeRes, {
        deep: true,
      });
      if (res.items) {
        tokenBalances = tokenBalances.concat(res.items);
      }
      nextPageParams = this.nextPageParamsToCursor(res.nextPageParams);
      loop += 1;
      await sleep(100);
    } while (nextPageParams && loop < maxLoop);

    if (!tokenBalances) {
      return [];
    }
    return tokenBalances.map((tokenBalance) => {
      const {
        value, // bn
        token,
      } = tokenBalance;
      return {
        ownerAddress: address,
        symbol: token.symbol,
        name: token.name,
        contractAddress: token.address,
        decimals: Number(token.decimals),
        balance: BigNumber.from(value || "0"),
        type: AssetType.TOKEN,
        uniqueId: this.uniqueId,
        icon: token.iconUrl,
      };
    });
  }

  async getTokenTransactionHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      token,
      pagination: { pageSize, pageNum, cursor: lastCursor },
    } = params;
    const page = (pageNum ?? 0) + 1;

    const snakeRes = await this.reqInstance.get(
      `/addresses/${address}/token-transfers?type=ERC-20&token=${token.contractAddress}&${lastCursor}`,
    );
    // @ts-expect-error camelcaseKeys type
    const res: TokenTransferResp = camelcaseKeys(snakeRes, {
      deep: true,
    });
    if (res.message !== undefined && !res.items && !res.nextPageParams) {
      throw new Error(res.message);
    }
    const { items: transactions, nextPageParams } = res;
    const cursor = this.nextPageParamsToCursor(nextPageParams);

    if (!transactions) {
      return {
        txs: [],
        pagination: { pageSize, pageNum: page, endReach: true },
      };
    }
    return {
      txs: transactions.map((transaction) => {
        const {
          from,
          to,
          txHash,
          timestamp,
          total,
          token: tokenInfo,
        } = transaction;

        const dateObject = new Date(timestamp ?? 0);
        const newTimestamp = dateObject.getTime();
        const fromAddress = from?.hash;
        const toAddress = to?.hash;

        return {
          id: txHash,
          from: toChecksumAddress(fromAddress),
          to: toChecksumAddress(toAddress),
          value: BigNumber.from(total.value).toBigInt(),
          timestamp: newTimestamp,
          decimals: Number(tokenInfo?.decimals),
          status: TransactionStatus.SUCCESS, // api 没给, 手动填充 success
          height: SpecificHeightValue.CONFIRM_WITHOUT_HEIGHT, // api 没给+1
        };
      }) as TransactionHistoryItem[],
      pagination: {
        pageSize,
        pageNum: page,
        endReach: !cursor,
        cursor,
      },
    };
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      pagination: { pageSize, pageNum, cursor: lastCursor },
    } = params;
    return await this.getTransactionHistory(
      address,
      pageNum,
      pageSize,
      lastCursor,
    );
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;
    return await this.queryUserInteractiveTokens(address);
  }

  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    return await this.getTokenTransactionHistory(params);
  }
}
