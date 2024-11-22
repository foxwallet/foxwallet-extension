import { FilfoxApi } from "core/coins/FIL/services/api/filfox";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type NativeCurrency } from "core/types/Currency";
import { FILECOIN_DELEGATED_ADDRESS_PREFIX } from "../../constants";
import {
  delegatedFromEthAddress,
  ethAddressFromDelegated,
} from "@glif/filecoin-address";
import { toChecksumAddress } from "core/coins/ETH/utils";
import {
  type NativeCoinTxDetailParams,
  type NativeCoinTxDetailRes,
  type NativeCoinTxHistoryParams,
} from "core/types/NativeCoinTransaction";
import { type TransactionHistoryResp } from "core/types/TransactionHistory";
import { CoinType as FilCoinType } from "@glif/filecoin-address/dist/coinType";
import { type CoinType } from "core/types";
import {
  type InteractiveTokenParams,
  type TokenTxHistoryParams,
} from "core/types/TokenTransaction";
import { AssetType, type TokenV2 } from "core/types/Token";
import { type TokenHoldingsRes } from "core/coins/FIL/services/api/filfox.di";
import { BigNumber } from "ethers";
import { getFEVMHexFromCid } from "@glif/filecoin-message";
import { TransactionStatus } from "core/types/TransactionStatus";

export class FilfoxService {
  filfoxApi: FilfoxApi;
  uniqueId: ChainUniqueId;
  nativeCurrency: NativeCurrency;

  constructor(
    url: string,
    uniqueId: ChainUniqueId,
    nativeCurrency: NativeCurrency,
  ) {
    this.filfoxApi = new FilfoxApi(url);
    this.uniqueId = uniqueId;
    this.nativeCurrency = nativeCurrency;
  }

  toEVMAddress(address: string): string {
    if (!address) {
      return "0x";
    }
    if (address.startsWith(FILECOIN_DELEGATED_ADDRESS_PREFIX)) {
      return toChecksumAddress(ethAddressFromDelegated(address));
    }
    return address;
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      pagination: { pageSize, pageNum },
    } = params;

    const network =
      this.uniqueId === InnerChainUniqueId.FILECOIN_EVM
        ? FilCoinType.MAIN
        : FilCoinType.TEST;
    const filAddr = delegatedFromEthAddress(address, network);

    const history = await this.filfoxApi.getAllTransactions(
      filAddr,
      pageNum ?? 0,
      pageSize,
      this.nativeCurrency,
    );
    return {
      ...history,
      txs: history.txs.map((item) => {
        return {
          ...item,
          from: this.toEVMAddress(item.from),
          to: this.toEVMAddress(item.to),
        };
      }),
    };
  }

  async getNativeCoinTxDetail(
    params: NativeCoinTxDetailParams,
  ): Promise<NativeCoinTxDetailRes<CoinType.ETH> | undefined> {
    const { txId } = params;
    const item = await this.filfoxApi.getFormattedTransactionDetail(txId);
    return {
      ...item,
      from: this.toEVMAddress(item.from),
      to: this.toEVMAddress(item.to),
    };
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;
    const tokenHoldings: TokenHoldingsRes =
      await this.filfoxApi.getTokenHoldings(address);
    if (!tokenHoldings?.ercTwentyList?.tokenList) {
      return [];
    }

    return tokenHoldings.ercTwentyList.tokenList.map((token) => {
      const { balance, tokenAddress, decimals, name, symbol } = token;
      return {
        ownerAddress: address,
        symbol,
        name,
        contractAddress: ethAddressFromDelegated(tokenAddress),
        decimals: Number(decimals),
        balance: BigNumber.from(balance || "0"),
        type: AssetType.TOKEN,
        uniqueId: this.uniqueId,
      };
    });
  }

  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const {
      address,
      token,
      pagination: { pageSize, pageNum },
    } = params;
    const page = pageNum ?? 0;
    const network =
      this.uniqueId === InnerChainUniqueId.FILECOIN_EVM
        ? FilCoinType.MAIN
        : FilCoinType.TEST;
    const userAddr = delegatedFromEthAddress(address, network);
    const contractAddr = delegatedFromEthAddress(
      token.contractAddress,
      network,
    );
    const tokenTxs = await this.filfoxApi.getTokenTransactionHistory(
      userAddr,
      contractAddr,
      page,
      pageSize,
    );
    if (!tokenTxs?.transfers) {
      return {
        txs: [],
        pagination: { pageSize, pageNum, endReach: true },
      };
    }

    return {
      txs: tokenTxs.transfers.map((item) => {
        return {
          id: getFEVMHexFromCid(item.message),
          from: this.toEVMAddress(item.from),
          to: this.toEVMAddress(item.to),
          value: BigNumber.from(item.value).toBigInt(),
          timestamp: item.timestamp * 1000,
          height: item.height,
          status: TransactionStatus.SUCCESS,
        };
      }),
      pagination: {
        pageSize,
        pageNum,
        endReach: tokenTxs.transfers.length < pageSize,
      },
    };
  }
}
