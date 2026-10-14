import { isEqual } from "lodash";
import { actions } from "@/store/actions";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { dedupeUserTokens } from "@/common/utils/userTokens";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useClient } from "@/hooks/useClient";

const getAssetBalanceKey = (asset: TokenV2) =>
  JSON.stringify([
    asset.uniqueId,
    asset.ownerAddress,
    asset.contractAddress,
    asset.programId,
    asset.tokenId,
    asset.type,
  ]);

const ASSET_BALANCE_CACHE_MS = 4500;

export const useUserAssets = () => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChains } = useChainMode();

  const assetIdentifiers = useMemo(
    () =>
      availableChains
        .map((item) => {
          const selectAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
          if (!selectAccount) return null;
          return {
            uniqueId: item.uniqueId,
            address: selectAccount.account.address,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [availableChains, getMatchAccountsWithUniqueId],
  );
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
        icon: chainConfig.nativeCurrency.logo ?? chainConfig.logo,
      };
      const nativeToken =
        uniqueId === InnerChainUniqueId.ALEO_MAINNET
          ? { ...ALEO_NATIVE_TOKEN, ...coin }
          : coin;
      const tokensWithOwner = tokens.map((t) => ({
        ...t,
        ownerAddress: t.ownerAddress || address,
      }));
      const dedupedTokens = dedupeUserTokens(uniqueId, tokensWithOwner);
      return [nativeToken, ...dedupedTokens];
    });
    return res.flat();
  }, [userTokensMap]);

  return assets;
};

// add price and change
export const useUserAssetsWithPrice = () => {
  const assets = useUserAssets();
  const { availableChainUniqueIds } = useChainMode();
  const { getMultiChainPrice } = useMultiChainPrice(availableChainUniqueIds);

  const key = useMemo(() => {
    const temp = availableChainUniqueIds.join("-");
    return `/useUserAssetsWithPrice/${temp}`;
  }, [availableChainUniqueIds]);

  const fetchData = useCallback(async () => {
    await getMultiChainPrice();
  }, [getMultiChainPrice]);

  const {
    mutate: getUserAssetsWithPrice,
    isLoading: isLoadingUserAssetsWithPrice,
  } = useSWR(key, fetchData, {
    refreshInterval: 10 * 1000,
  });

  const prices = usePopupSelector((state) => {
    return coinPriceSelector(state);
  });
  // console.log("      allPrices", prices);

  const assetsWithPrice = useMemo(() => {
    return assets.map((item) => {
      const { uniqueId, contractAddress } = item;
      const chainItems = prices[uniqueId];
      let exchange: ExchangeItem | undefined;
      if (contractAddress && chainItems?.tokens) {
        exchange = chainItems.tokens[contractAddress.toLowerCase()];
      } else if (chainItems?.baseCurrency) {
        exchange = chainItems.baseCurrency;
      }
      if (exchange) {
        return { ...item, ...exchange };
      }
      return item;
    });
  }, [assets, prices]);

  return {
    assetsWithPrice,
    isLoadingUserAssetsWithPrice,
    getUserAssetsWithPrice,
  };
};

// add balance and value
export const useUserAssetsWithPriceBalanceAndValue = () => {
  const { assetsWithPrice: assets } = useUserAssetsWithPrice();
  const { popupServerClient } = useClient();
  const [balanceByAsset, setBalanceByAsset] = useState<
    Record<string, BalanceResp>
  >({});
  const balanceCache = useRef(
    new Map<string, { balance: BalanceResp; updatedAt: number }>(),
  );
  const balanceRequests = useRef(
    new Map<string, Promise<BalanceResp | undefined>>(),
  );

  const fetchData = useCallback(async () => {
    const promises = assets.map(async (item) => {
      const balanceKey = getAssetBalanceKey(item);
      const cached = balanceCache.current.get(balanceKey);
      if (cached && Date.now() - cached.updatedAt < ASSET_BALANCE_CACHE_MS) {
        return { ...item, ...cached.balance };
      }

      let balanceRequest = balanceRequests.current.get(balanceKey);
      if (!balanceRequest) {
        balanceRequest = (async () => {
          const {
            uniqueId,
            contractAddress,
            programId,
            tokenId,
            ownerAddress: address,
            type,
          } = item;
          const coinService = coinServiceEntry.getInstance(uniqueId);
          const hasContractAddress = !!contractAddress;
          const isAleoToken =
            uniqueId === InnerChainUniqueId.ALEO_MAINNET &&
            type === AssetType.TOKEN &&
            !!programId &&
            !!tokenId;

          let balance: BalanceResp | undefined;
          if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
            await popupServerClient.scannerRegister({
              chainId: coinService.config.chainId,
              address,
            });
          }
          if (hasContractAddress || isAleoToken) {
            if (hasContractAddress) {
              balance = await coinService.getTokenBalance({
                address,
                token: { contractAddress },
              });
            } else if (programId && tokenId) {
              balance = await coinService.getTokenBalance({
                address,
                token: { contractAddress: `${programId}-${tokenId}` },
              });
            }
          } else {
            balance = await coinService.getBalance(address);
          }
          return balance;
        })();
        balanceRequests.current.set(balanceKey, balanceRequest);
      }

      let balance: BalanceResp | undefined;
      try {
        balance = await balanceRequest;
      } finally {
        if (balanceRequests.current.get(balanceKey) === balanceRequest) {
          balanceRequests.current.delete(balanceKey);
        }
      }
      if (balance) {
        balanceCache.current.set(balanceKey, {
          balance,
          updatedAt: Date.now(),
        });
        setBalanceByAsset((current) => ({
          ...current,
          [balanceKey]: balance,
        }));
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
  }, [assets, popupServerClient]);

  const key = useMemo(() => {
    const sortedAssets = [...assets].sort(
      (a, b) =>
        a.uniqueId.localeCompare(b.uniqueId) ||
        a.contractAddress?.localeCompare(b.contractAddress),
    );
    const assetKeys = sortedAssets.map((asset) => [
      asset.uniqueId,
      asset.contractAddress,
      asset.programId,
      asset.tokenId,
      asset.ownerAddress,
      asset.type,
    ]);
    return `/useUserAssetsWithPriceBalance/${JSON.stringify(assetKeys)}`;
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
    const cachedBalances = new Map(
      (data ?? [])
        .filter((item) => item.total !== undefined)
        .map((item) => [getAssetBalanceKey(item), item]),
    );
    return assets.map((asset) => {
      const balance =
        balanceByAsset[getAssetBalanceKey(asset)] ??
        cachedBalances.get(getAssetBalanceKey(asset));
      const item = balance ? { ...asset, ...balance } : asset;
      const { decimals, price, total } = item;
      if (price !== undefined && total !== undefined) {
        const num = Number(utils.formatUnits(total, decimals));
        const value = num * price;
        return { ...item, value };
      }
      return item;
    });
  }, [assets, balanceByAsset, data]);

  const sortedAssets = useMemo(() => {
    return [...assetsWithValue].sort((a, b) => {
      if (a.value === undefined) return 1;
      if (b.value === undefined) return -1;
      return b.value - a.value;
    });
  }, [assetsWithValue]);

  return {
    userAssetsWithPriceAndBalance: sortedAssets,
    error,
    getUserAssetsWithPriceBalance,
    loadingUserAssetsWithPriceBalance,
  };
};

export const useGroupAccountAssets = () => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChains } = useChainMode();
  const dispatch = usePopupDispatch();

  const assetIdentifiers = useMemo(
    () =>
      availableChains
        .map((item) => {
          const selectAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
          if (!selectAccount) return null;
          return {
            uniqueId: item.uniqueId,
            address: selectAccount.account.address,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [availableChains, getMatchAccountsWithUniqueId],
  );

  // 获取需要更新的账户
  const needUpdateMap = usePopupSelector(
    (state) =>
      assetIdentifiers.map((item) => {
        const { address, uniqueId } = item;
        const lastUpdateTimestamp =
          state.tokens?.lastUpdateTimestamp[uniqueId]?.[address];
        return {
          address,
          uniqueId,
          needUpdate: !lastUpdateTimestamp,
        };
      }),
    isEqual,
  );

  const updatePartialTokens = useCallback(
    (result: {
      uniqueId: TokenV2["uniqueId"];
      address: string;
      tokens: TokenV2[];
    }) => {
      dispatch(actions.tokens.updateAddressTokens(result));
    },
    [dispatch],
  );

  const { getGroupInteractiveTokens } = useGroupInteractiveTokens(
    needUpdateMap,
    true,
    updatePartialTokens,
  );

  const key = useMemo(() => {
    const temp = assetIdentifiers
      .map((item) => {
        return `${item.uniqueId}-${item.address}`;
      })
      .join("-");
    return `/useGroupAccountAssets/${temp}`;
  }, [assetIdentifiers]);

  const fetchData = useCallback(async () => {
    try {
      const res = await getGroupInteractiveTokens();
      if (res && res.length > 0) {
        res.forEach(({ uniqueId, address }) => {
          dispatch(
            actions.tokens.updateTimestamp({
              uniqueId,
              address,
              newUpdateTimestamp: Date.now(),
            }),
          );
        });
      }
    } catch (error) {
      console.warn("Failed to update tokens:", error);
    }
  }, [dispatch, getGroupInteractiveTokens]);

  const {
    mutate: getGroupAccountAssets,
    isLoading: loadingGroupAccountAssets,
  } = useSWR(key, fetchData, {
    refreshInterval: 10 * 1000,
  });

  const { userAssetsWithPriceAndBalance: assets } =
    useUserAssetsWithPriceBalanceAndValue();
  // console.log("      assets", assets);

  const totalUsdValue = useMemo(() => {
    const temp = assets
      .filter(
        (item) =>
          item.price !== undefined &&
          item.total !== undefined &&
          item.decimals !== undefined,
      )
      .reduce((total: number, currentValue: TokenV2) => {
        return Number(total) + Number(currentValue?.value?.toString() ?? 0);
      }, 0);
    return commaInteger(formatPrice(temp).toString());
  }, [assets]);

  return {
    assets,
    totalUsdValue,
    loadingGroupAccountAssets,
    getGroupAccountAssets,
  };
};
