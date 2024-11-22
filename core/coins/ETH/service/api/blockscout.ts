import {
  type BlockApiResult,
  type TokenBalance,
  type TokenTransfer,
  type Transaction,
  type TransactionInfo,
} from "./blockscout.di";
import { createRequestInstance } from "@/common/utils/request";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type AxiosInstance } from "axios";
import { type NativeCoinTxHistoryParams } from "core/types/NativeCoinTransaction";
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

interface TxListParams {
  module: string;
  action: string;
  sort: string;
  address: string;
  page: number;
  offset: number;
  startblock?: string;
  endblock?: string;
}

export class BlockscoutApi {
  reqInstance: AxiosInstance;
  baseUrl: string;
  uniqueId: ChainUniqueId;

  constructor(url: string, uniqueId: ChainUniqueId) {
    this.reqInstance = createRequestInstance(url, 15000);
    this.baseUrl = url;
    this.uniqueId = uniqueId;
  }

  async getTransactionHistory(
    address: string,
    pageNum: number,
    pageSize: number,
    lastCursor?: string,
  ): Promise<TransactionHistoryResp> {
    const params: TxListParams = {
      module: "account",
      action: "txlist",
      sort: "desc",
      address,
      page: pageNum,
      offset: pageSize,
    };
    if (this.baseUrl === "https://scan.merlinchain.io/api") {
      params.startblock = "0";
      params.endblock = "latest";
      params.page += 1;
    }
    const apiRes: BlockApiResult<Transaction[]> = await this.reqInstance.get(
      "",
      {
        params,
      },
    );
    if (apiRes.status === "0" || !apiRes.result) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, endReach: true },
      };
    }
    const transactions: Transaction[] = apiRes.result;

    return {
      txs: transactions.map((transaction) => {
        const {
          nonce, // bn
          from,
          to,
          blockNumber, // bn
          confirmations, // bn
          timeStamp, // num 1671053471
          value, // bn
          hash,
          cumulativeGasUsed, // bn
          isError,
          input: data,
        } = transaction;
        const status = confirmations
          ? isError === "0"
            ? TransactionStatus.SUCCESS
            : TransactionStatus.FAILED
          : TransactionStatus.PENDING;
        const toAddr = toChecksumAddress(to ?? "0x");
        return {
          id: hash,
          from: toChecksumAddress(from),
          to: toAddr,
          data,
          nonce: Number(nonce),
          value: BigNumber.from(value).toBigInt(),
          fees: BigNumber.from(cumulativeGasUsed).toBigInt(),
          confirmations: Number(confirmations),
          timestamp: Number(timeStamp) * 1000,
          height: Number(blockNumber),
          status,
          label: getTxLabelEVM(data, toAddr),
        };
      }),
      pagination: {
        pageNum,
        pageSize,
        endReach: transactions.length < pageSize,
      },
    };
  }

  async getTransactionDetail(id: string): Promise<TransactionInfo | undefined> {
    const apiRes: BlockApiResult<TransactionInfo> = await this.reqInstance.get(
      `?module=transaction&action=gettxinfo&txhash=${id}`,
    );
    if (apiRes.status === "0") {
      return undefined;
    }
    return apiRes.result;
  }

  async queryUserInteractiveTokens(address: string): Promise<TokenV2[]> {
    const apiRes: BlockApiResult<TokenBalance[]> = await this.reqInstance.get(
      ``,
      {
        params: {
          module: "account",
          action: "tokenlist",
          address,
        },
      },
    );
    if (apiRes.status === "0") {
      throw new Error(apiRes.message);
    }
    const interactiveTokens: TokenBalance[] | undefined = apiRes.result.filter(
      (token) =>
        token.type === "ERC-20" &&
        token.contractAddress &&
        token.decimals &&
        token.symbol,
    ); // 只保留"ERC-20" token;

    if (!interactiveTokens) {
      return [];
    }
    return interactiveTokens.map((token) => {
      const {
        balance, // bn
        contractAddress,
        decimals, // bn
        name,
        symbol,
      } = token;
      return {
        ownerAddress: address,
        symbol,
        name,
        contractAddress,
        decimals: Number(decimals),
        balance: BigNumber.from(balance || "0"),
        type: AssetType.TOKEN,
        uniqueId: this.uniqueId,
      };
    });
  }

  async getTokenTransactionHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      token,
      pagination: { pageSize, pageNum },
    } = params;
    const page = (pageNum ?? 0) + 1;

    const apiRes: BlockApiResult<TokenTransfer[]> = await this.reqInstance.get(
      ``,
      {
        params: {
          module: "account",
          action: "tokentx",
          sort: "desc",
          address,
          contractaddress: token.contractAddress,
          page,
          offset: pageSize,
        },
      },
    );
    if (apiRes.status === "0" || !Array.isArray(apiRes.result)) {
      throw new Error(`${apiRes.result as string}`);
    }

    const tokenTransfer: TokenTransfer[] = apiRes.result;
    return {
      txs: tokenTransfer.map((transaction) => {
        const {
          nonce,
          from,
          to,
          hash,
          blockNumber, // bn
          confirmations, // bn
          timeStamp, // num 1671053471
          value, // bn
          gasPrice, // bn
          gasUsed, // bn
          tokenDecimal,
        } = transaction;
        const status = confirmations
          ? TransactionStatus.SUCCESS
          : TransactionStatus.PENDING;
        return {
          id: hash,
          from: toChecksumAddress(from),
          to: toChecksumAddress(to),
          nonce: Number(nonce),
          value: BigNumber.from(value).toBigInt(),
          fees: BigNumber.from(gasPrice).mul(gasUsed).toBigInt(),
          confirmations: Number(confirmations),
          timestamp: Number(timeStamp) * 1000,
          height: Number(blockNumber),
          decimals: Number(tokenDecimal),
          status,
        };
      }) as TransactionHistoryItem[],
      pagination: {
        pageSize,
        pageNum,
        endReach: tokenTransfer.length < pageSize,
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
