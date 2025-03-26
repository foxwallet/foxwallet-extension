import { type ChainUniqueId } from "core/types/ChainUniqueId";

export type TokenPrice = {
  token: string | undefined;
  price: number | undefined;
  change: string | undefined;
};

export type ChainTokenPriceMap = {
  [uniqueId in ChainUniqueId]?: TokenPrice[];
};

export type ExchangeItemTokenPrice = {
  token: string | undefined;
  price: string | undefined;
  change: string | undefined;
};

export type ChainTokenPriceResp = {
  [uniqueId in ChainUniqueId]?: ExchangeItemTokenPrice[];
};

export type TokensPriceRes = {
  status: number;
  msg: string;
  data: ExchangeItemTokenPrice[];
};

export type CurrencyItem = {
  symbol: string;
  rate: string;
};

export type CurrencyRes = {
  status: number;
  msg: string;
  data: CurrencyItem[];
};

export enum RampType {
  BUY = "buy",
  Sell = "sell",
}
