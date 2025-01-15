import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import { isEqual } from "lodash";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type SupportCurrency } from "core/constants/currency";
import {
  type ChainTokenPriceMap,
  type TokenPrice,
} from "core/types/TokenPrice";

export type ExchangeItem = {
  price?: number | undefined;
  change?: string | undefined;
};

export type TokenPriceMap = {
  [contractAddress: string]: ExchangeItem | undefined; // key contractAddress 为纯小写
};

export type ChainItems = {
  baseCurrency: ExchangeItem | undefined;
  tokens: TokenPriceMap | undefined;
};

export type ChainPriceMap = {
  [uniqueId in ChainUniqueId]?: ChainItems;
};

export type CurrencyItems = {
  symbol: SupportCurrency;
  rate: string;
  prefix?: string;
};

export type ChainPriceModel = {
  prices: ChainPriceMap;
  exchangeRate: CurrencyItems[];
  fiatRate: CurrencyItems[];
  fiatRateMap: { [uniqueId in ChainUniqueId]: CurrencyItems[] };
};

export const coinPriceV2 = createModel<RootModel>()({
  name: "coinPriceV2",
  state: {
    prices: {} as ChainPriceMap,
    exchangeRate: [] as CurrencyItems[],
    fiatRate: [] as CurrencyItems[],
    fiatRateMap: {},
  } as ChainPriceModel,
  reducers: {
    batchUpdateTokensPrice(
      state,
      payload: {
        exchangeMap: ChainTokenPriceMap;
      },
    ) {
      const { exchangeMap } = payload;
      if (!exchangeMap) {
        return state;
      }
      const uniqueIds = Object.keys(exchangeMap) as ChainUniqueId[];
      // 用于表示新数据与当前 state 是否一致
      let flag = false;
      const newPricesModel: ChainPriceMap = { ...state.prices };
      for (const uniqueId of uniqueIds) {
        const chainMap = newPricesModel[uniqueId] ?? {
          baseCurrency: undefined,
          tokens: {},
        };
        const exchangeItems = exchangeMap[uniqueId] ?? [];
        // 如果已经变了就不对比了，反正也要改
        if (
          !flag &&
          exchangeItems.every((exchangeItem) => {
            if (!exchangeItem.token) {
              return isEqual(exchangeItem, chainMap.baseCurrency);
            } else {
              return isEqual(
                {
                  price: exchangeItem.price,
                  change: exchangeItem.change,
                },
                chainMap.tokens?.[exchangeItem.token.toLowerCase()],
              );
            }
          })
        ) {
          continue;
        }
        flag = true;
        let newBaseCurrency = chainMap.baseCurrency ?? {};
        if (exchangeItems.length > 0) {
          newBaseCurrency = exchangeItems[0];
        }
        const currTokens = chainMap.tokens;
        const newTokens: TokenPriceMap = {};
        exchangeItems.forEach((item) => {
          if (item.token) {
            newTokens[item.token.toLowerCase()] = {
              price: item.price,
              change: item.change,
            };
          }
        });
        newPricesModel[uniqueId] = {
          baseCurrency: newBaseCurrency,
          tokens: {
            ...currTokens,
            ...newTokens,
          },
        };
      }

      if (!flag) {
        console.log("batchUpdateTokensPrice price is already up to date.");
        return state;
      }

      return {
        ...state,
        prices: newPricesModel,
      };
    },
    updateTokensPrice(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        exchangeItems: TokenPrice[];
      },
    ) {
      const { uniqueId, exchangeItems } = payload;
      if (!exchangeItems) {
        return state;
      }
      const prices = state.prices;
      const chainMap = prices[uniqueId] ?? {
        baseCurrency: undefined,
        tokens: {},
      };
      if (
        exchangeItems.every((exchangeItem) => {
          if (!exchangeItem.token) {
            return isEqual(exchangeItem, chainMap.baseCurrency);
          } else {
            return isEqual(
              {
                price: exchangeItem.price,
                change: exchangeItem.change,
              },
              chainMap.tokens?.[exchangeItem.token.toLowerCase()],
            );
          }
        })
      ) {
        return state;
      }
      let newBaseCurrency = chainMap.baseCurrency ?? {};
      if (exchangeItems.length > 0) {
        newBaseCurrency = exchangeItems[0];
      }
      const currTokens = chainMap.tokens;
      const newTokens: TokenPriceMap = {};
      exchangeItems.forEach((item) => {
        if (item.token) {
          newTokens[item.token.toLowerCase()] = {
            price: item.price,
            change: item.change,
          };
        }
      });
      return {
        ...state,
        prices: {
          ...prices,
          [uniqueId]: {
            baseCurrency: newBaseCurrency,
            tokens: {
              ...currTokens,
              ...newTokens,
            },
          } as ChainItems,
        },
      };
    },
    updateExchangeRate(
      state,
      payload: {
        exchangeRateArray: CurrencyItems[];
      },
    ) {
      const { exchangeRateArray } = payload;
      return {
        ...state,
        exchangeRate: exchangeRateArray,
      };
    },
    updateFiatRate(
      state,
      payload: {
        fiatRate: CurrencyItems[];
      },
    ) {
      const { fiatRate } = payload;
      return {
        ...state,
        fiatRate,
      };
    },
    updateFiatRateMap(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        fiatRate: CurrencyItems[];
      },
    ) {
      const { uniqueId, fiatRate } = payload;
      return {
        ...state,
        fiatRateMap: {
          ...state.fiatRateMap,
          [uniqueId]: fiatRate,
        },
      };
    },
  },
});
