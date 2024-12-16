import {
  type TokenRes,
  type TransactionHistoryRes,
  type TransactionRes,
  type TransactionTokenRes,
} from "./blockbook.di";
import { createRequestInstance } from "@/common/utils/request";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type AxiosInstance } from "axios";
import { type NativeCoinTxHistoryParams } from "core/types/NativeCoinTransaction";
import {
  type TransactionHistoryItem,
  type TransactionHistoryResp,
} from "core/types/TransactionHistory";
import { isSameAddress } from "core/utils/address";
import { TransactionStatus } from "core/types/TransactionStatus";
import { getTxLabelEVM, toChecksumAddress } from "../../utils";
import { BigNumber } from "ethers";
import {
  type InteractiveTokenParams,
  type TokenTxHistoryParams,
} from "core/types/TokenTransaction";
import { AssetType, type TokenV2 } from "core/types/Token";

export class BlockbookApi {
  reqInstance: AxiosInstance;
  uniqueId: ChainUniqueId;

  constructor(url: string, uniqueId: ChainUniqueId) {
    this.reqInstance = createRequestInstance(url);
    this.uniqueId = uniqueId;
  }

  async getTransactionHistory(
    address: string,
    page: number,
    pageSize: number,
  ): Promise<TransactionHistoryRes> {
    return this.reqInstance.get(`/api/v2/address/${address}`, {
      params: {
        page,
        pageSize,
        details: "txs",
      },
    });
  }

  async getTransactionDetail(id: string): Promise<TransactionRes> {
    return this.reqInstance.get(`/api/v2/tx/${id}`);
  }

  async queryUserInteractiveTokens(address: string): Promise<TokenRes[]> {
    const res: TransactionTokenRes = await this.reqInstance.get(
      `/api/v2/address/${address}`,
      {
        params: {
          details: "tokenBalances",
        },
      },
    );
    if (res.address === undefined) {
      // if blockbook is not well synced, res.address will be undefined, so we raise Network Error to switch next
      throw new Error("Network Error");
    }
    if (res.tokens) {
      const type = this.uniqueId === InnerChainUniqueId.BNB ? "BEP20" : "ERC20";
      return res.tokens.filter((item) => {
        return (
          item.type === type &&
          item.decimals &&
          item.symbol &&
          item.contract &&
          item.balance !== "0"
        );
      });
    }
    return [];
  }

  async getTokenTransactionHistory(
    address: string,
    contractAddress: string,
    page: number,
    pageSize: number = 50,
  ): Promise<TransactionHistoryRes> {
    return this.reqInstance.get(`/api/v2/address/${address}`, {
      params: {
        page,
        pageSize,
        details: "txs",
        contract: contractAddress,
      },
    });
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      pagination: { pageSize, pageNum },
    } = params;
    // block book 的 index 从 1 开始
    const page = (pageNum ?? 0) + 1;
    const history: TransactionHistoryRes = await this.getTransactionHistory(
      address,
      page,
      pageSize,
    );
    if (history.address === undefined) {
      // if blockbook is not well synced, raise Network Error to switch next
      throw new Error("Network Error");
    }

    if (!history?.transactions || history.page !== page) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, totalCount: 0, endReach: true },
      };
    }
    const { transactions } = history;
    const nonTokenTransferTxs = transactions.filter((transaction) => {
      const addressIn = transaction.vin[0].addresses[0];
      const addressOut = transaction.vout[0].isAddress
        ? transaction.vout[0].addresses[0]
        : "0x";
      return (
        isSameAddress(addressIn, address) || isSameAddress(addressOut, address)
      );
    });
    return {
      txs: nonTokenTransferTxs.map((transaction) => {
        const {
          value,
          vin,
          vout,
          blockTime,
          txid,
          fees,
          confirmations,
          ethereumSpecific,
        } = transaction;
        const addressIn = vin[0].addresses[0];
        const addressOut = vout[0].isAddress ? vout[0].addresses[0] : "0x";
        const status = confirmations
          ? ethereumSpecific?.status
            ? TransactionStatus.SUCCESS
            : TransactionStatus.FAILED
          : TransactionStatus.PENDING;
        const to = toChecksumAddress(addressOut);
        const data = transaction.ethereumSpecific?.data ?? "0x";
        return {
          id: txid,
          from: toChecksumAddress(addressIn),
          to,
          nonce: transaction.ethereumSpecific?.nonce,
          value: BigNumber.from(value).toBigInt(),
          fees: BigNumber.from(fees).toBigInt(),
          confirmations,
          timestamp: blockTime * 1000,
          height: transaction.blockHeight,
          data,
          status,
          label: getTxLabelEVM(data, to),
        };
      }),
      pagination: {
        pageNum,
        pageSize,
        totalCount: history.nonTokenTxs,
        endReach: page * pageSize >= history.nonTokenTxs,
      },
    };
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;
    const tokens = await this.queryUserInteractiveTokens(address);

    if (tokens && tokens.length > 0) {
      return tokens.map((item) => {
        const { symbol, contract, decimals, balance, name } = item;
        return {
          ownerAddress: address,
          symbol,
          name,
          contractAddress: contract,
          decimals,
          balance: BigNumber.from(balance || "0"),
          type: AssetType.TOKEN,
          uniqueId: this.uniqueId,
        };
      });
    }
    return [];
  }

  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      token,
      pagination: { pageSize, pageNum },
    } = params;
    const page = (pageNum ?? 0) + 1;
    const history: TransactionHistoryRes =
      await this.getTokenTransactionHistory(
        address,
        token.contractAddress,
        page,
      );

    if (history.address === undefined) {
      // if blockbook is not well synced, raise Network Error to switch next
      throw new Error("Network Error");
    }

    if (!history?.transactions || history.page !== page) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, totalPage: -1, endReach: true },
      };
    }

    const { transactions } = history;
    const tokenTransferTxs = transactions.filter((transaction) => {
      return (
        transaction.tokenTransfers && transaction.tokenTransfers.length > 0
      );
    });
    return {
      txs: tokenTransferTxs
        .map((transaction) => {
          const {
            blockTime,
            txid,
            fees,
            confirmations,
            tokenTransfers,
            ethereumSpecific,
          } = transaction;
          if (!tokenTransfers) {
            return undefined;
          }
          const addressTransfer = tokenTransfers.filter((tokenTransfer) => {
            return (
              (tokenTransfer.contract ?? tokenTransfer.token).toLowerCase() ===
                token.contractAddress.toLowerCase() &&
              (tokenTransfer.from.toLowerCase() === address.toLowerCase() ||
                tokenTransfer.to.toLowerCase() === address.toLowerCase())
            );
          })[0];
          if (!addressTransfer) {
            return undefined;
          }
          const status = confirmations
            ? ethereumSpecific?.status
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED
            : TransactionStatus.PENDING;
          return {
            id: txid,
            from: toChecksumAddress(addressTransfer.from),
            to: toChecksumAddress(addressTransfer.to),
            nonce: ethereumSpecific?.nonce,
            value: BigNumber.from(addressTransfer.value).toBigInt(),
            fees: BigNumber.from(fees).toBigInt(),
            confirmations,
            timestamp: blockTime * 1000,
            height: transaction.blockHeight,
            decimals: addressTransfer.decimals,
            status,
          };
        })
        .filter((res) => !!res) as TransactionHistoryItem[],
      pagination: {
        pageSize,
        pageNum,
        totalPage: history.totalPages,
        endReach: page >= history.totalPages,
      },
    };
  }
}
