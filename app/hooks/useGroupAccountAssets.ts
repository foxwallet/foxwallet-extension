import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { useEffect, useMemo } from "react";
import { useGroupInteractiveTokens } from "@/hooks/useToken";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { AssetType, type TokenV2 } from "core/types/Token";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { useSelector } from "react-redux";
import { coinPriceSelector } from "@/store/selectors/token";
import { type ExchangeItem } from "@/store/coinPriceModelV2";
import { useMultiChainPrice } from "@/hooks/useTokenPrice";

export const useUserAssets = () => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChains, availableChainUniqueIds } = useChainMode();

  const assetIdentifiers = availableChains.map((item) => {
    const selectAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
    return { uniqueId: item.uniqueId, address: selectAccount.account.address };
  });
  // 获取用户的代币数据
  const userTokensMap = usePopupSelector((state) => {
    const res = assetIdentifiers.map((item) => {
      const { address, uniqueId } = item;
      const tokens = state.tokens.userTokens[uniqueId]?.[address] ?? [];
      return {
        address,
        uniqueId,
        tokens,
      };
    });
    return res;
  }, isEqual);

  const assets = useMemo(() => {
    const res = userTokensMap.map((item) => {
      const { uniqueId, address, tokens } = item;
      const coinService = coinServiceEntry.getInstance(uniqueId);
      const chainConfig = { ...coinService.config };
      const nativeCurrency = { ...chainConfig.nativeCurrency };

      const coin: TokenV2 = {
        contractAddress: "",
        decimals: nativeCurrency.decimals,
        ownerAddress: address,
        symbol: nativeCurrency.symbol,
        type: AssetType.COIN,
        uniqueId,
        icon: chainConfig.logo,
      };
      const nativeToken =
        uniqueId === InnerChainUniqueId.ALEO_MAINNET
          ? { ...ALEO_NATIVE_TOKEN, ...coin }
          : coin;
      return [nativeToken, ...tokens];
    });
    return res.flat();
  }, [userTokensMap]);

  const { getMultiChainPrice } = useMultiChainPrice(availableChainUniqueIds);

  useEffect(() => {
    const getPrice = async () => {
      await getMultiChainPrice();
    };
    getPrice();
  }, [getMultiChainPrice]);

  const prices = usePopupSelector((state) => {
    return coinPriceSelector(state);
  });

  const assetsWithPrice = useMemo(() => {
    return assets.map((item) => {
      const { uniqueId, contractAddress } = item;
      const chainItems = prices[uniqueId];
      let exchange: ExchangeItem | undefined;
      if (contractAddress && chainItems?.tokens) {
        exchange = chainItems.tokens[contractAddress];
      } else if (chainItems?.baseCurrency) {
        exchange = chainItems.baseCurrency;
      }
      if (exchange) {
        return { ...item, ...exchange };
      }
      return item;
    });
  }, [assets, prices]);

  return assetsWithPrice;
};

export const useGroupAccountAssets = () => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChains } = useChainMode();
  const dispatch = usePopupDispatch();

  const assetIdentifiers = availableChains.map((item) => {
    const selectAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
    return { uniqueId: item.uniqueId, address: selectAccount.account.address };
  });

  // 获取需要更新的账户
  const needUpdateMap = usePopupSelector((state) => {
    const res = assetIdentifiers.map((item) => {
      const { address, uniqueId } = item;
      const now = Date.now();
      const lastUpdateTimestamp =
        state.tokens?.lastUpdateTimestamp[uniqueId]?.[address];
      const needUpdate = !lastUpdateTimestamp;
      return {
        address,
        uniqueId,
        needUpdate,
      };
    });
    return res;
  });

  const { getGroupInteractiveTokens } = useGroupInteractiveTokens(
    needUpdateMap,
    true,
  );

  // 获取用户的代币数据
  // const userTokensMap = usePopupSelector((state) => {
  //   const res = assetIdentifiers.map((item) => {
  //     const { address, uniqueId } = item;
  //     const tokens = state.tokens.userTokens[uniqueId]?.[address] ?? [];
  //     return {
  //       address,
  //       uniqueId,
  //       tokens,
  //     };
  //   });
  //   return res;
  // }, isEqual);

  useEffect(() => {
    const updateTokens = async () => {
      try {
        const res = await getGroupInteractiveTokens();
        if (res && res.length > 0) {
          res.forEach(({ uniqueId, address, tokens }) => {
            dispatch.tokens.updateAddressTokens({
              uniqueId,
              address,
              tokens,
            });
            dispatch.tokens.updateTimestamp({
              uniqueId,
              address,
              newUpdateTimestamp: Date.now(),
            });
          });
        }
      } catch (error) {
        console.log("Failed to update tokens:", error);
      }
    };
    void updateTokens();
  }, [dispatch.tokens, getGroupInteractiveTokens]);

  // const assets = useMemo(() => {
  //   const res = userTokensMap.map((item) => {
  //     const { uniqueId, address, tokens } = item;
  //     const coinService = coinServiceEntry.getInstance(uniqueId);
  //     const chainConfig = { ...coinService.config };
  //     const nativeCurrency = { ...chainConfig.nativeCurrency };
  //
  //     const coin: TokenV2 = {
  //       contractAddress: "",
  //       decimals: nativeCurrency.decimals,
  //       ownerAddress: address,
  //       symbol: nativeCurrency.symbol,
  //       type: AssetType.COIN,
  //       uniqueId,
  //       icon: chainConfig.logo,
  //     };
  //     const nativeToken =
  //       uniqueId === InnerChainUniqueId.ALEO_MAINNET
  //         ? { ...ALEO_NATIVE_TOKEN, ...coin }
  //         : coin;
  //     return [nativeToken, ...tokens];
  //   });
  //   return res.flat();
  // }, [userTokensMap]);

  const assets = useUserAssets();

  return { assets };
};
