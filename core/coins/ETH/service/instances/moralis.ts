import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type NativeCoinTxHistoryParams } from "core/types/NativeCoinTransaction";
import {
  type InteractiveTokenParams,
  type TokenTxHistoryParams,
} from "core/types/TokenTransaction";
import { type TransactionHistoryResp } from "core/types/TransactionHistory";
import { TransactionStatus } from "core/types/TransactionStatus";
import { BigNumber } from "ethers";
import { getTxLabelEVM, toChecksumAddress } from "../../utils";
import { MoralisApi } from "../api/moralis";
import {
  type TokenTransactionRes,
  type NativeTransactionRes,
  type TransactionHistReq,
  type UserInteractiveTokensReq,
  type UserInteractiveTokenRes,
} from "../api/moralis.di";
import camelcaseKeys from "camelcase-keys";
import { AssetType, type TokenV2 } from "core/types/Token";

type NFTsAsset = {
  amount: string;
  block_number: string;
  block_number_minted: string;
  contract_type: string;
  metadata: string;
  name: string;
  owner_of: string;
  symbol: string;
  synced_at: string;
  token_address: string;
  token_hash: string;
  token_id: string;
  token_uri: string;
  verified_collection: boolean;
  possible_spam: boolean;
};

export type NFTsResp = {
  total: number;
  page: number;
  page_size: number;
  cursor: string | null;
  result: NFTsAsset[];
};

export type NFTsResyncResp = {
  status: string;
};

export class MoralisService {
  moralisApi: MoralisApi;
  uniqueId: ChainUniqueId;

  constructor(uniqueId: ChainUniqueId) {
    this.moralisApi = new MoralisApi();
    this.uniqueId = uniqueId;
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      pagination: { pageSize, pageNum, cursor: lastCursor },
    } = params;
    const req: TransactionHistReq = {
      address,
      uniqueId: this.uniqueId,
      cursor: lastCursor,
      limit: pageSize,
    };

    const res = await this.moralisApi.getNativeTransactionHistory(req);
    const history: NativeTransactionRes =
      camelcaseKeys(res ?? {}, { deep: true }) ?? [];
    if (history.message !== undefined || history.pageSize === undefined) {
      throw new Error(history.message);
    }
    if (
      !history ||
      history.result?.length === 0 ||
      history.page === undefined
    ) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, totalCount: 0, endReach: true },
      };
    }
    const { result: transactions } = history;
    return {
      txs: transactions!.map((transaction) => {
        const {
          value,
          fromAddress,
          toAddress,
          nonce,
          gas,
          blockNumber,
          input,
          receiptStatus,
          hash,
          blockTimestamp,
        } = transaction;

        const status =
          receiptStatus === "1"
            ? TransactionStatus.SUCCESS
            : receiptStatus === "0"
            ? TransactionStatus.FAILED
            : TransactionStatus.PENDING;

        // moralis的时间戳格式为 "block_timestamp": "2023-08-02T08:12:47.000Z"
        const dateObject = new Date(blockTimestamp ?? 0);
        const timestamp = dateObject.getTime();
        const to = toChecksumAddress(toAddress ?? "0x");
        const data = input ?? "0x";
        return {
          id: hash,
          from: toChecksumAddress(fromAddress),
          to,
          nonce,
          value: BigNumber.from(value).toBigInt(),
          fees: BigNumber.from(gas).toBigInt(),
          timestamp,
          height: blockNumber,
          data,
          status,
          time: blockTimestamp,
          label: getTxLabelEVM(data, to),
        };
      }),
      pagination: {
        pageNum,
        pageSize,
        cursor: history.cursor,
        endReach: !history.cursor,
      },
    };
  }

  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      token,
      pagination: { pageSize, pageNum, cursor: lastCursor },
    } = params;
    const req: TransactionHistReq = {
      address,
      contractAddress: token.contractAddress,
      uniqueId: this.uniqueId,
      cursor: lastCursor,
      limit: pageSize,
    };

    const res = await this.moralisApi.getTokenTransactionHistory(req);
    const history: TokenTransactionRes =
      camelcaseKeys((res ?? {}) as any, { deep: true }) ?? [];
    if (history.message !== undefined || history.pageSize === undefined) {
      throw new Error(history.message);
    }
    if (
      !history ||
      history.result?.length === 0 ||
      history.page === undefined
    ) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, totalCount: 0, endReach: true },
      };
    }
    const { result: transactions } = history;
    return {
      txs:
        transactions?.map((transaction) => {
          const {
            value,
            fromAddress,
            toAddress,
            blockNumber,
            transactionHash,
            blockTimestamp,
          } = transaction;

          // moralis的时间戳格式为 "block_timestamp": "2023-08-02T08:12:47.000Z"
          const dateObject = new Date(blockTimestamp ?? 0);
          const timestamp = dateObject.getTime();
          const to = toChecksumAddress(toAddress ?? "0x");

          return {
            id: transactionHash,
            from: toChecksumAddress(fromAddress),
            to,
            value: BigNumber.from(value).toBigInt(),
            timestamp,
            height: blockNumber,
            status: TransactionStatus.SUCCESS,
            time: blockTimestamp,
          };
        }) ?? [],
      pagination: {
        pageNum,
        pageSize,
        cursor: history.cursor,
        endReach: !history.cursor,
      },
    };
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;
    const req: UserInteractiveTokensReq = {
      address,
      uniqueId: this.uniqueId,
      excludeSpam: true,
    };

    const tokensRes = await this.moralisApi?.getUserInteractiveTokens(req);
    const tokens: UserInteractiveTokenRes =
      camelcaseKeys(tokensRes ?? [], { deep: true }) ?? [];

    const res: TokenV2[] = [];
    tokens.forEach((token) => {
      const {
        balance,
        tokenAddress,
        decimals,
        name,
        symbol,
        logo,
        thumbnail,
        verifiedContract,
        possibleSpam,
      } = token;
      if (verifiedContract && !possibleSpam) {
        res.push({
          type: AssetType.TOKEN,
          uniqueId: this.uniqueId,
          ownerAddress: address,
          symbol: symbol ?? "",
          name,
          contractAddress: tokenAddress,
          decimals: Number(decimals ?? 18),
          total: BigInt(balance ?? ""),
          icon: logo ?? thumbnail,
        });
      }
    });
    console.log("===> moralis getUserInteractiveTokens ", this.uniqueId, res);

    return res;
  }
}
