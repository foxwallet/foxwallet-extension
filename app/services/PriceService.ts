import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  type ChainTokenPriceMap,
  type ChainTokenPriceResp,
  type TokenPrice,
} from "core/types/TokenPrice";

export const convertPriceToNum = (
  price: string | undefined,
): number | undefined => {
  if (typeof price === "number") {
    return isNaN(price) ? undefined : price;
  }
  if (!price) {
    return undefined;
  }
  const priceStr = price.replace(/,/g, "");
  return parseFloat(priceStr);
};

class PriceService {
  async getTokensPrice(
    uniqueId: ChainUniqueId,
  ): Promise<TokenPrice[] | undefined> {
    return undefined;
  }

  async getChainsTokensPrice(
    uniqueIds: ChainUniqueId[],
  ): Promise<ChainTokenPriceMap> {
    // const resp = await walletApiRequest.get(routes.TOKENS_PRICE_V2, {
    //   params: {
    //     unique_id: uniqueIds.join(","),
    //   },
    // });
    // if (resp && resp.status === 0 && resp.data) {
    //   const respMap = resp.data as ChainTokenPriceResp;
    //   return uniqueIds.reduce<ChainTokenPriceMap>((map, uniqueId) => {
    //     const tokens = respMap[uniqueId] ?? [];
    //     map[uniqueId] = tokens.map((item) => ({
    //       token: item.token ?? "",
    //       price: convertPriceToNum(item.price),
    //       change: item.change,
    //     }));
    //     return map;
    //   }, {});
    // }
    return {};
  }

  // async getCurrency(): Promise<CurrencyItems[]> {
  //   const res: CurrencyRes = await walletApiRequest.get(routes.EXCHANGE_RATE);
  //   if (res && res.status === 0 && res.msg === "success") {
  //     const array: CurrencyItems[] = res?.data
  //       ?.filter((i) => Object.keys(CURRENCY).includes(i.symbol))
  //       ?.map((item: CurrencyItem) => {
  //         return {
  //           symbol: item.symbol as SupportCurrency,
  //           rate: item.rate,
  //         };
  //       });
  //     return array;
  //   }
  //   return [];
  // }

  // async getFiatCurrency(
  //   uniqueId: ChainUniqueId = InnerChainUniqueId.ETHEREUM,
  //   rampType: RampType = RampType.BUY,
  //   coin_id?: number,
  // ): Promise<CurrencyItems[]> {
  //   const params: any = {
  //     unique_id: uniqueId,
  //     type: rampType,
  //   };
  //   if (coin_id) {
  //     params.coin_id = coin_id;
  //   }
  //   const res: CurrencyRes = await walletApiRequest.get(routes.FIAT_RATE, {
  //     params,
  //   });
  //   if (res && res.status === 0 && res.msg === "success") {
  //     const array: CurrencyItems[] = res?.data?.map(
  //       (item: CurrencyItem & { icon?: string }) => {
  //         return {
  //           symbol: item.symbol as SupportCurrency,
  //           rate: item.rate,
  //           prefix: item.icon,
  //         };
  //       },
  //     );
  //     return array;
  //   }
  //   return [];
  // }
}

export const priceService = new PriceService();
