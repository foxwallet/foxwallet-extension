import { tokenApi } from "./api/token";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenMarket, type TokenV2 } from "core/types/Token";

class TokenService {
  async getRecommend(uniqueId: ChainUniqueId): Promise<TokenV2[]> {
    try {
      return await tokenApi.getRecommendTokens(uniqueId);
    } catch (err) {
      console.log("error getRecommend:", err);
      return [];
    }
  }

  async getAllTokens(uniqueId: ChainUniqueId): Promise<TokenV2[]> {
    try {
      return await tokenApi.queryTokens(uniqueId, {});
    } catch (err) {
      console.log("error getAllTokens:", err);
      return [];
    }
  }

  async getTokenInfo({
    contractAddress,
    uniqueId,
  }: {
    contractAddress: string;
    uniqueId: ChainUniqueId;
  }): Promise<TokenMarket | undefined> {
    try {
      return await tokenApi.getTokenInfo({ uniqueId, contractAddress });
    } catch (error) {
      return undefined;
    }
  }
}
export const tokenService = new TokenService();
