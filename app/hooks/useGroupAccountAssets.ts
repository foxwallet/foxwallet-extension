import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGroupInteractiveTokens } from "@/hooks/useToken";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { AssetType, type TokenV2 } from "core/types/Token";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import {
  assetListSelector,
  coinPriceSelector,
  selectedTokensMapSelector,
} from "@/store/selectors/token";
import { type ExchangeItem } from "@/store/coinPriceModelV2";
import { useMultiChainPrice } from "@/hooks/useTokenPrice";
import type { BalanceResp } from "core/types/Balance";
import useSWR from "swr";
import { utils } from "ethers";
import { commaInteger } from "@/common/utils/comma";
import { formatPrice } from "@/common/utils/num";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { type OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";
import { HttpError, HttpErrorType } from "@/common/types/error";
import { HTTP_REQUEST_TIMEOUT } from "@/common/constants";
import { BatchBalanceItem } from "@/store/coinBalanceModelV2";

// export const useUserAssets = () => {
//   const { getMatchAccountsWithUniqueId } = useGroupAccount();
//   const { availableChains } = useChainMode();

//   const assetIdentifiers = availableChains.map((item) => {
//     const selectAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
//     return { uniqueId: item.uniqueId, address: selectAccount.account.address };
//   });
//   // 获取用户的代币数据
//   const userTokensMap = usePopupSelector((state) => {
//     const res = assetIdentifiers.map((item) => {
//       const { address, uniqueId } = item;
//       const tokens = state.tokens.userTokens[uniqueId]?.[address] ?? [];
//       return {
//         address,
//         uniqueId,
//         tokens,
//       };
//     });
//     return res;
//   }, isEqual);

//   const assets = useMemo(() => {
//     const res = userTokensMap.map((item) => {
//       const { uniqueId, address, tokens } = item;
//       const coinService = coinServiceEntry.getInstance(uniqueId);
//       const chainConfig = { ...coinService.config };
//       const nativeCurrency = { ...chainConfig.nativeCurrency };

//       const coin: TokenV2 = {
//         contractAddress: "",
//         decimals: nativeCurrency.decimals,
//         ownerAddress: address,
//         symbol: nativeCurrency.symbol,
//         type: AssetType.COIN,
//         uniqueId,
//         icon: chainConfig.nativeCurrency.logo ?? chainConfig.logo,
//       };
//       const nativeToken =
//         uniqueId === InnerChainUniqueId.ALEO_MAINNET
//           ? { ...ALEO_NATIVE_TOKEN, ...coin }
//           : coin;
//       return [nativeToken, ...tokens];
//     });
//     return res.flat();
//   }, [userTokensMap]);

//   if (assets.length > 0) {
//     console.log("testAssets useUserAssets", assets);
//   }

//   return assets;
// };

// add price and change
// export const useUserAssetsWithPrice = () => {
//   // const assets = useUserAssets();
//   const assets = useSelector(
//     (state: RootState) => assetListSelector(state),
//     isEqual,
//   );
//   const { availableChainUniqueIds } = useChainMode();
//   const { getMultiChainPrice } = useMultiChainPrice(availableChainUniqueIds);

//   const key = useMemo(() => {
//     const temp = availableChainUniqueIds.join("-");
//     return `/useUserAssetsWithPrice/${temp}`;
//   }, [availableChainUniqueIds]);

//   const fetchData = useCallback(async () => {
//     await getMultiChainPrice();
//   }, [getMultiChainPrice]);

//   const {
//     mutate: getUserAssetsWithPrice,
//     isLoading: isLoadingUserAssetsWithPrice,
//   } = useSWR(key, fetchData, {
//     refreshInterval: 10 * 1000,
//   });

//   const prices = usePopupSelector((state) => {
//     return coinPriceSelector(state);
//   });
//   // console.log("      allPrices", prices);

//   const assetsWithPrice = useMemo(() => {
//     return assets.map((item) => {
//       const { uniqueId, contractAddress } = item;
//       const chainItems = prices[uniqueId];
//       let exchange: ExchangeItem | undefined;
//       if (contractAddress && chainItems?.tokens) {
//         exchange = chainItems.tokens[contractAddress.toLowerCase()];
//       } else if (chainItems?.baseCurrency) {
//         exchange = chainItems.baseCurrency;
//       }
//       if (exchange) {
//         return { ...item, ...exchange };
//       }
//       return item;
//     });
//   }, [assets, prices]);

//   return {
//     assetsWithPrice,
//     isLoadingUserAssetsWithPrice,
//     getUserAssetsWithPrice,
//   };
// };

// add balance and value
export const useUserAssetsWithPriceBalanceAndValue = () => {
  // const { assetsWithPrice: assets } = useUserAssetsWithPrice();
  const assets = useSelector(
    (state: RootState) => assetListSelector(state),
    isEqual,
  );
  if (assets.length > 0) {
    console.log("testAssets useUserAssetsWithPrice", assets);
  }

  const fetchData = useCallback(async () => {
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
      // console.log("      balance", balance);
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
      .map(
        (asset) =>
          `${asset.uniqueId}-${asset.contractAddress}-${asset.ownerAddress}`,
      )
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
    if (!assets || assets.length === 0) {
      return [];
    }
    return assets.map((item) => {
      const { decimals, price, total } = item;
      if (!!price && total !== undefined) {
        const num = Number(utils.formatUnits(total, decimals));
        const value = num * price;
        return { ...item, value };
      }
      return item;
    });
  }, [assets]);

  const sortedAssets = useMemo(() => {
    return [...assetsWithValue].sort((a, b) => {
      if (a.value === undefined) return 1;
      if (b.value === undefined) return -1;
      return b.value - a.value;
    });
  }, [assetsWithValue]);

  if (sortedAssets.length > 0) {
    console.log("testAssets sortedAssets", sortedAssets);
  }

  return {
    userAssetsWithPriceAndBalance: sortedAssets,
    error,
    getUserAssetsWithPriceBalance,
    loadingUserAssetsWithPriceBalance,
  };
};

const getAssetBalance = async (
  asset: TokenV2,
  address: string,
): Promise<BatchBalanceItem | undefined> => {
  const {
    uniqueId,
    contractAddress,
    programId,
    tokenId,
    ownerAddress: address,
    type,
  } = asset;
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
  // console.log("      balance", balance);
  return balance ? { ...asset, ...balance } : asset;
};

const getAssetWithTimeout = async (asset: TokenV2, address: string) => {
  const racePromise = new Promise<HttpError>((resolve) => {
    setTimeout(() => {
      resolve(new HttpError(HttpErrorType.TIMEOUT));
    }, HTTP_REQUEST_TIMEOUT);
  });
  const res = await Promise.race([
    getAssetBalance(asset, address),
    racePromise,
  ]).catch((err) => {
    console.error("getAssetWithTimeout error: ", err);
    return undefined;
  });
  if (res instanceof HttpError) {
    return undefined;
  }
  return res;
};

export const useGroupAccountAssets = () => {
  const { getMatchAccountsWithUniqueId, groupAccount } = useGroupAccount();
  const { availableChains, availableChainUniqueIds } = useChainMode();
  const dispatch = usePopupDispatch();

  const { getMultiChainPrice } = useMultiChainPrice(availableChainUniqueIds);

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

  const assetList = useSelector(
    (state: RootState) => assetListSelector(state),
    isEqual,
  );
  const [delayAssetList, setDelayAssetList] = useState<TokenV2[]>([]);
  const assetListRef = useRef(assetList);
  const [loadingAssetList, setLoadingAssetList] = useState(false);

  const selectedUniqueIdsRef = useRef<ChainUniqueId[] | null>(null);
  const groupAccountRef = useRef<OneMatchGroupAccount | null>(null);

  useEffect(() => {
    if (
      availableChainUniqueIds !== selectedUniqueIdsRef.current ||
      groupAccount !== groupAccountRef.current
    ) {
      setLoadingAssetList(true);
      setDelayAssetList([]);
      selectedUniqueIdsRef.current = availableChainUniqueIds;
      groupAccountRef.current = groupAccount;
    }
    const timer = setTimeout(() => {
      setDelayAssetList(assetList);
      setLoadingAssetList(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [assetList, availableChainUniqueIds, groupAccount]);

  const [loadingBalance, setLoadingBalance] = useState(false);
  const loadingBalanceRef = useRef(loadingBalance);
  const refreshAssetBalance = useCallback(async () => {
    console.log("===> refreshAssetBalance loading ", loadingBalanceRef.current);
    if (loadingBalanceRef.current) {
      return;
    }
    setLoadingBalance(true);
    const assetGroups: Array<Array<{ asset: TokenV2; address: string }>> = [];
    let assetGroup: Array<{ asset: TokenV2; address: string }> = [];
    assetListRef.current.forEach((item) => {
      assetGroup.push({
        asset: item,
        address: item.ownerAddress,
      });

      if (assetGroup.length >= 20) {
        assetGroups.push(assetGroup);
        assetGroup = [];
      }
    });
    // the last group
    if (assetGroup.length > 0) {
      assetGroups.push(assetGroup);
    }
    for (const assets of assetGroups) {
      const assetsBalances = (
        await Promise.allSettled(
          assets.map(({ asset, address }) =>
            getAssetWithTimeout(asset, address),
          ),
        )
      )
        .filter((item) => item.status === "fulfilled" && !!item.value)
        .map((item) => (item as PromiseResolved<BatchBalanceItem>).value);
      console.log("===> assetsBalances ", assetsBalances.length, assets.length);
      dispatch.coinBalanceV2.batchUpdateBalance({ items: assetsBalances });
    }
    setLoadingBalance(false);
  }, [assetListRef, dispatch.coinBalanceV2, loadingBalanceRef]);

  // const key = useMemo(() => {
  //   const temp = assetIdentifiers
  //     .map((item) => {
  //       return `${item.uniqueId}-${item.address}`;
  //     })
  //     .join("-");
  //   return `/useGroupAccountAssets/${temp}`;
  // }, [assetIdentifiers]);

  // const fetchData = useCallback(async () => {
  //   try {
  //     const res = await getGroupInteractiveTokens();
  //     if (res && res.length > 0) {
  //       res.forEach(({ uniqueId, address, tokens }) => {
  //         dispatch.tokens.updateAddressTokens({
  //           uniqueId,
  //           address,
  //           tokens,
  //         });
  //         dispatch.tokens.updateTimestamp({
  //           uniqueId,
  //           address,
  //           newUpdateTimestamp: Date.now(),
  //         });
  //       });
  //     }
  //   } catch (error) {
  //     console.log("Failed to update tokens:", error);
  //   }
  // }, [dispatch.tokens, getGroupInteractiveTokens]);

  // const {
  //   mutate: getGroupAccountAssets,
  //   isLoading: loadingGroupAccountAssets,
  // } = useSWR(key, fetchData, {
  //   refreshInterval: 10 * 1000,
  // });

  const getGroupAccountAssets = useCallback(async () => {
    try {
      await Promise.all([getMultiChainPrice(), getGroupInteractiveTokens()]);
    } catch (err) {
      console.log("refreshAssets error ", err);
    }
  }, [getMultiChainPrice, getGroupInteractiveTokens]);

  const totalUsdValue = useMemo(() => {
    const temp = assetList
      .filter((item) => !!item.price && !!item.total && !!item.decimals)
      .reduce((total: number, currentValue: TokenV2) => {
        return Number(total) + Number(currentValue?.value?.toString() ?? 0);
      }, 0);
    return commaInteger(formatPrice(temp).toString());
  }, [assetList]);

  return {
    assets: delayAssetList,
    totalUsdValue,
    getGroupAccountAssets,
    loadingGroupAccountAssets: loadingAssetList,
  };
};
