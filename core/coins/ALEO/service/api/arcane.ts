import { get, post } from "@/common/utils/request";
import { AllTokenResp } from "./token.di";
import { Token } from "../../types/Token";
import { ALPHA_TOKEN_PROGRAM_ID } from "../../constants";
import { ArcaneTokensResp } from "./arcane.di";

export class ArcaneApi {
  host: string;
  chainId: string;

  constructor(config: { host: string; chainId: string }) {
    const { host, chainId } = config;
    this.host = host;
    this.chainId = chainId;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  async fetchData<Type>(url = "/"): Promise<Type> {
    const response = await get(`${this.host}${url}`);
    if (!response.ok) {
      throw new Error(
        `get error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    return await response.json();
  }

  async postData<Type>(
    url = "/",
    body: any,
    headers: Record<string, string>,
  ): Promise<Type> {
    const response = await post(`${this.host}${url}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    if (!response.ok) {
      throw new Error(
        `get error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    return await response.json();
  }

  async getTokens(): Promise<Token[]> {
    const resp = await this.fetchData<ArcaneTokensResp>(`/token/all`);
    return resp.tokens
      .filter((item) => item.verified)
      .map((item) => ({
        tokenId: `${item.tokenId.value}field`,
        name: item.name ?? item.symbol,
        symbol: item.symbol,
        decimals: Number(item.decimals.value),
        logo: item.logo,
        official: true,
        programId: item.program,
      }));
  }

  async searchTokens(keyword: string): Promise<Token[]> {
    try {
      const formatText = keyword.endsWith("field")
        ? keyword.slice(0, -5).toLowerCase()
        : keyword.toLowerCase();
      const tokens = await this.getTokens();
      const result = tokens.filter((item) => {
        if (
          item.name.toLowerCase().includes(formatText) ||
          item.symbol.toLowerCase().includes(formatText)
        ) {
          return true;
        }
        return false;
      });
      return result;
    } catch (err) {
      console.error("arcane search error: ", err);
      return [];
    }
  }
}
