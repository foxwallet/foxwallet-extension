import { type RootState } from "@/store/store";
import { createSelector } from "reselect";
import {
  InnerChainUniqueId,
  type ChainUniqueId,
} from "core/types/ChainUniqueId";
import { type UserTokensMap } from "@/store/token";
import {
  currChainConfigsSelector,
  selectedGroupAccountSelector,
} from "./account";
import { matchAccountsWithUniqueId } from "../accountV2";
import { AssetType, type TokenV2 } from "core/types/Token";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { groupBy, uniqBy } from "lodash";
import { utils } from "ethers";

const createAppSelector = createSelector.withTypes<RootState>();

export const userTokensSelector = (state: RootState) => {
  return state.tokens.userTokens;
};

export const coinPriceSelector = (state: RootState) => {
  return state.coinPriceV2.prices;
};

export const coinBalanceV2Selector = (state: RootState) => {
  return state.coinBalanceV2;
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

export const selectedTokensMapSelector = createAppSelector(
  [userTokensSelector, currChainConfigsSelector, selectedGroupAccountSelector],
  (userTokens, chainConfigs, groupAccount) => {
    console.log("===> selector selectTokensMapSelector");

    const tokensMap: { [key in ChainUniqueId]?: TokenV2[] } = {};
    for (const chainConfig of chainConfigs) {
      const { uniqueId } = chainConfig;
      const nativeCurrency = chainConfig.nativeCurrency;
      const accounts = matchAccountsWithUniqueId(groupAccount, uniqueId);
      const accountsTokens: TokenV2[] = [];

      for (const account of accounts) {
        const { address } = account;
        const coin: TokenV2 = {
          ...nativeCurrency,
          uniqueId,
          type: AssetType.COIN,
          contractAddress: "",
          icon: chainConfig.nativeCurrency.logo ?? chainConfig.logo,
          ownerAddress: address,
        };
        const nativeToken =
          uniqueId === InnerChainUniqueId.ALEO_MAINNET
            ? { ...ALEO_NATIVE_TOKEN, ...coin }
            : coin;
        accountsTokens.push(nativeToken);

        const chainTokens = userTokens[uniqueId];
        if (chainTokens) {
          accountsTokens.push(...(chainTokens[address] ?? []));
        }
      }
      tokensMap[uniqueId] = uniqBy(
        accountsTokens,
        (t) =>
          `${t.contractAddress.toLowerCase()}-${t.ownerAddress.toLowerCase()}`,
      );
    }
    return tokensMap;
  },
);

export const assetListSelector = createAppSelector(
  [selectedTokensMapSelector, coinBalanceV2Selector, coinPriceSelector],
  (tokensMap, coinBalanceV2, coinPrice) => {
    console.log("===> selector assetList");

    const newTokenMap = { ...tokensMap };
    const uniqueIds = Object.keys(tokensMap) as ChainUniqueId[];
    let assets: TokenV2[] = [];

    console.log(
      "===> assetListSelector start update balance/price/change and group assets",
    );

    for (const uniqueId of uniqueIds) {
      const tokens = newTokenMap[uniqueId] ?? [];
      const balanceMap = coinBalanceV2[uniqueId];
      const coinBalanceMap = balanceMap?.baseCurrency;
      const tokenBalanceMap = balanceMap?.tokens;
      const priceMap = coinPrice[uniqueId];
      const tokenPriceMap = priceMap?.tokens;
      // 更新 price balance 信息
      tokens.forEach((token, i) => {
        const address = token.ownerAddress;
        if (token.type === AssetType.COIN || !token.contractAddress) {
          tokens[i] = {
            ...token,
            total: coinBalanceMap?.[address]?.total ?? token.total,
            privateBalance:
              coinBalanceMap?.[address]?.privateBalance ?? token.privateBalance,
            publicBalance:
              coinBalanceMap?.[address]?.publicBalance ?? token.publicBalance,
            availableBalance:
              coinBalanceMap?.[address]?.availableBalance ??
              token.availableBalance,
            price: priceMap?.baseCurrency?.price,
            change: priceMap?.baseCurrency?.change,
          };
        } else {
          const lowerTokenAddr = token.contractAddress.toLowerCase();
          tokens[i] = {
            ...token,
            total:
              tokenBalanceMap?.[lowerTokenAddr]?.[address]?.total ??
              token.total,
            privateBalance:
              tokenBalanceMap?.[lowerTokenAddr]?.[address]?.privateBalance ??
              token.privateBalance,
            publicBalance:
              tokenBalanceMap?.[lowerTokenAddr]?.[address]?.publicBalance ??
              token.publicBalance,
            availableBalance:
              tokenBalanceMap?.[lowerTokenAddr]?.[address]?.availableBalance ??
              token.availableBalance,
            price: tokenPriceMap?.[lowerTokenAddr]?.price,
            change: tokenPriceMap?.[lowerTokenAddr]?.change,
          };
        }
      });
      // 聚合资产
      const groupTokens = groupBy(tokens, (token) => token.contractAddress);
      for (const token of Object.values(groupTokens)) {
        const asset = token.reduce((prevAsset: TokenV2, curr) => {
          const {
            ownerAddress,
            total,
            privateBalance,
            publicBalance,
            availableBalance,
            ...rest
          } = curr;
          return {
            ...rest,
            ...prevAsset,
            total: (prevAsset.total ?? 0n) + (total ?? 0n),
          } as TokenV2;
        }, token[0]);

        if (asset.price) {
          asset.value =
            Number(utils.formatUnits(asset.total || 0, asset.decimals)) *
            asset.price;
        }
        if (asset.uniqueId) {
          assets.push(asset);
        } else {
          console.error("asset uniqueId is undefined: ", asset);
        }
      }
    }
    console.log("===> groupAssetListSelector start sortAssets");
    assets = assets.sort((item1, item2) =>
      `${item1.symbol}-${item1.contractAddress}`.localeCompare(
        `${item2.symbol}-${item2.contractAddress}`,
      ),
    );
    console.log("===> groupAssetListSelector done sortAssets");
    return assets;
  },
);
