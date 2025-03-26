import { walletApiRequest } from "@/common/utils/request";
import {
  type TransactionHistReq,
  type NativeTransactionRes,
  type NFTCollectionsReq,
  type NFTCollectionsResp,
  type NFTsByCollectionReq,
  type NFTsByCollectionResp,
  type UserInteractiveTokenRes,
  type UserInteractiveTokensReq,
  type TokenTransactionRes,
} from "./moralis.di";
import snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

export class MoralisApi {
  async getNativeTransactionHistory(
    req: TransactionHistReq,
  ): Promise<NativeTransactionRes> {
    const { address, ...rest } = req;
    const params = { ...rest };
    // GNOSIS不支持internal transactions
    // if (req.uniqueId !== InnerChainUniqueId.GNOSIS) {
    //   params = { include: "internal_transactions", ...params };
    // }
    return await walletApiRequest.get(`/public/wrap_api/v2/${address}`, {
      params: snakecaseKeys(params),
    });
  }

  async getTokenTransactionHistory(
    req: TransactionHistReq,
  ): Promise<TokenTransactionRes> {
    const { address, ...rest } = req;
    const params = { ...rest };
    return await walletApiRequest.get(
      `/public/wrap_api/v2/${address}/erc20/transfers`,
      {
        params: snakecaseKeys(params),
      },
    );
  }

  async getUserInteractiveTokens(
    req: UserInteractiveTokensReq,
  ): Promise<UserInteractiveTokenRes> {
    return await walletApiRequest.get(
      `/public/wrap_api/v2/${req.address}/erc20`,
      {
        params: snakecaseKeys(req),
      },
    );
  }

  async getNFTCollections(req: NFTCollectionsReq): Promise<NFTCollectionsResp> {
    const { address, ...rest } = req;
    const res = await walletApiRequest.get(
      `/public/wrap_nft/v2/${address}/nft/collections`,
      {
        params: snakecaseKeys(rest),
      },
    );
    const ret: NFTCollectionsResp =
      camelcaseKeys((res ?? {}) as any, { deep: true }) ?? [];
    return ret;
  }

  async getNFTsByCollection(
    req: NFTsByCollectionReq,
  ): Promise<NFTsByCollectionResp | undefined> {
    const { address, ...rest } = req;
    const res = await walletApiRequest.get(
      `public/wrap_nft/v2/${address}/nft`,
      {
        params: snakecaseKeys(rest),
      },
    );
    if (res && res.status === 0 && res.data) {
      return camelcaseKeys(res.data ?? {}, { deep: true }) ?? [];
    }
    return undefined;
  }
}
