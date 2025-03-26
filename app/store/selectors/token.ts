import { type RootState } from "@/store/store";
import { createSelector } from "reselect";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type UserTokensMap } from "@/store/token";

const createAppSelector = createSelector.withTypes<RootState>();

export const userTokensSelector = (state: RootState) => {
  return state.tokens.userTokens;
};

export const coinPriceSelector = (state: RootState) => {
  return state.coinPriceV2.prices;
};

export const userTokenPriceSelector = createAppSelector(
  [userTokensSelector, coinPriceSelector],
  (userTokenMap, priceMap) => {
    const newTokenMap: UserTokensMap = { ...userTokenMap };
    const uniqueIds = Object.keys(userTokenMap) as ChainUniqueId[];
    console.log("      uniqueIds", uniqueIds);

    for (const uniqueId of uniqueIds) {
      const tokenMap = newTokenMap[uniqueId];
      const chainItems = priceMap[uniqueId];
    }
  },
);
