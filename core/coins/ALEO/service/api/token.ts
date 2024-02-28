import { get, post } from "@/common/utils/request";
import { AllTokenResp } from "./token.di";
import { Token } from "../../types/Token";
import { ALPHA_TOKEN_PROGRAM_ID } from "../../constants";

export const TOKEN_IMG_HOST = "https://app.alphaswap.pro/ims/image/";

export class TokenApi {
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
    const resp = await this.fetchData<AllTokenResp>(`/tokens`);
    if (resp.code !== 0) {
      throw new Error(resp.msg);
    }
    return resp.data.tokens.map((item) => ({
      tokenId: `${item.token_id}field`,
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals,
      logo: `${TOKEN_IMG_HOST}${item.logo}`,
      // 1 is verified token, 2 is user created token
      official: item.token_type === 1,
      programId: ALPHA_TOKEN_PROGRAM_ID,
    }));
  }

  async searchTokens(keyword: string): Promise<Token[]> {
    const formatText = keyword.endsWith("field")
      ? keyword.slice(0, -5)
      : keyword;
    const resp = await this.fetchData<AllTokenResp>(
      `/search/tokens/${formatText}?_=${Date.now()}`,
    );
    if (resp.code !== 0) {
      throw new Error(resp.msg);
    }
    return resp.data.tokens.map((item) => ({
      tokenId: `${item.token_id}field`,
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals,
      logo: `${TOKEN_IMG_HOST}${item.logo}`,
      // 1 is verified token, 2 is user created token
      official: item.token_type === 1,
      programId: ALPHA_TOKEN_PROGRAM_ID,
    }));
  }
}
