import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { useGroupInteractiveTokens } from "@/hooks/useToken";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { AssetType, type TokenV2 } from "core/types/Token";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { coinPriceSelector } from "@/store/selectors/token";
import { type ExchangeItem } from "@/store/coinPriceModelV2";
import { useMultiChainPrice } from "@/hooks/useTokenPrice";
import type { BalanceResp } from "core/types/Balance";
import useSWR from "swr";
import { utils } from "ethers";
import { commaInteger } from "@/common/utils/comma";
import { formatPrice } from "@/common/utils/num";

export const useUserAssets = () => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChains } = useChainMode();

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

  return assets;
};

export const useUserAssetsWithPrice = () => {
  const assets = useUserAssets();
  const { availableChainUniqueIds } = useChainMode();
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

export const useUserAssetsWithPriceBalance = () => {
  const assets = useUserAssetsWithPrice();

  const fetchData = useCallback(async () => {
    console.log("      fetchData useUserAssetsWithPriceBalance");
    const promises = assets.map(async (item) => {
      const {
        uniqueId,
        contractAddress,
        programId,
        tokenId,
        ownerAddress: address,
        type,
      } = item;
      const coinService = coinServiceEntry.getInstance(uniqueId);

      let balance: BalanceResp | undefined;
      if (type === AssetType.TOKEN) {
        if (contractAddress) {
          balance = await coinService.getTokenBalance({
            address,
            token: { contractAddress },
          });
        } else {
          if (
            uniqueId === InnerChainUniqueId.ALEO_MAINNET &&
            programId &&
            tokenId
          ) {
            balance = await coinService.getTokenBalance({
              address,
              token: { contractAddress: `${programId}-${tokenId}` },
            });
          }
        }
      } else {
        balance = await coinService.getBalance(address);
      }
      return balance ? { ...item, ...balance } : item;
    });
    const results = await Promise.allSettled(promises);

    const validResults: TokenV2[] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return assets[index];
      }
    });
    // console.log("      validResults", validResults);
    return validResults;
  }, [assets]);

  const key = useMemo(() => {
    const sortedAssets = [...assets].sort(
      (a, b) =>
        a.uniqueId.localeCompare(b.uniqueId) ||
        a.contractAddress.localeCompare(b.contractAddress),
    );
    const temp = sortedAssets
      .map((asset) => `${asset.uniqueId}-${asset.contractAddress}`)
      .join("-");
    return `/useUserAssetsWithPriceBalance/${temp}`;
  }, [assets]);

  const {
    data,
    error,
    mutate: getUserAssetsWithPriceBalance,
    isLoading: loadingUserAssetsWithPriceBalance,
  } = useSWR(key, fetchData, {
    refreshInterval: 5 * 1000,
  });

  const assetsWithValue = useMemo(() => {
    return data?.map((item) => {
      const { decimals, price, total } = item;
      if (!!price && !!total) {
        const num = Number(utils.formatUnits(total, decimals));
        const value = num * price;
        return { ...item, value };
      }
      return item;
    });
  }, [data]);

  return {
    userAssetsWithPriceBalance: assetsWithValue,
    error,
    getUserAssetsWithPriceBalance,
    loadingUserAssetsWithPriceBalance,
  };
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

  const { userAssetsWithPriceBalance: assets } =
    useUserAssetsWithPriceBalance();
  // console.log("      assets", assets);

  const totalUsdValue = useMemo(() => {
    if (!assets) {
      return "";
    }
    const temp = assets
      .filter((item) => !!item.price && !!item.total && !!item.decimals)
      .reduce((total: number, currentValue: TokenV2) => {
        return Number(total) + Number(currentValue?.value?.toString() ?? 0);
      }, 0);
    return commaInteger(formatPrice(temp).toString());
  }, [assets]);

  return { assets, totalUsdValue };
};
