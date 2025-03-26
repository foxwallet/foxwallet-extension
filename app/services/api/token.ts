import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  AssetType,
  type TokenMarket,
  type TokenSecurity,
  type TokenV2,
} from "core/types/Token";
import { walletApiRequest } from "@/common/utils/request";
import { routes } from "@/common/constants";
import { type TokenListRes } from "@/services/api/token.di";
import { useMemo } from "react";

class TokenApi {
  public async getRecommendTokens(uniqueId: ChainUniqueId): Promise<TokenV2[]> {
    const res: TokenListRes = await walletApiRequest.get(routes.TOKEN, {
      params: {
        status: "active",
        tag: "recommend",
        unique_id: uniqueId,
      },
    });
    if (res && res.status === 0 && res.data && res.data.length > 0) {
      // console.log("      getRecommendTokens", res.data);
      return res.data.map((item) => {
        const {
          token,
          decimals,
          symbol,
          display,
          icon,
          type,
          change,
          price,
          security,
        } = item;
        const resItem: TokenV2 = {
          contractAddress: token,
          decimals,
          ownerAddress: "",
          symbol,
          uniqueId,
          type: AssetType.TOKEN,
          display,
          icon,
          subType: type,
          change,
          security: security as TokenSecurity,
          // price: convertPriceToNum(item.price),
        };
        return resItem;
      });
    }
    return [];
  }

  public async queryTokens(
    uniqueId: ChainUniqueId,
    {
      symbol,
      contractAddress,
    }: {
      symbol?: string;
      contractAddress?: string;
    },
  ): Promise<TokenMarket[]> {
    const res: TokenListRes = await walletApiRequest.get(routes.TOKEN, {
      params: {
        status: "active",
        symbol: symbol ?? "",
        contractAddress: contractAddress ?? "",
        unique_id: uniqueId,
      },
    });
    if (res && res.status === 0 && res.data && res.data.length > 0) {
      return res.data.map((item) => {
        const resItem: TokenMarket = {
          type: AssetType.TOKEN,
          subType: item.type,
          symbol: item.symbol,
          display: item.display,
          decimals: item.decimals,
          contractAddress: item.token,
          security: item.security as TokenSecurity,
          icon: item.icon,
          uniqueId,
          // price: convertPriceToNum(item.price),
          change: item.change,
        };
        return resItem;
      });
    }
    return [];
  }

  public async getTokenInfo({
    contractAddress,
    uniqueId,
  }: {
    contractAddress: string;
    uniqueId: ChainUniqueId;
  }): Promise<TokenMarket | undefined> {
    const res: TokenListRes = await walletApiRequest.get(routes.TOKEN, {
      params: {
        token: contractAddress ?? "",
        unique_id: uniqueId,
      },
    });
    if (res && res.status === 0 && res.data?.[0]) {
      const item = res.data[0];
      const resItem: TokenMarket = {
        type: AssetType.TOKEN,
        subType: item.type,
        symbol: item.symbol,
        display: item.display,
        decimals: item.decimals,
        contractAddress: item.token,
        security: item.security as TokenSecurity,
        icon: item.icon,
        uniqueId,
        // price: convertPriceToNum(item.price),
        change: item.change,
      };
      return resItem;
    }
    return undefined;
  }
}

export const tokenApi = new TokenApi();
