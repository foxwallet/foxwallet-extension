import { type Dispatch, type RootState } from "@/store/store";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { POLL_ALL_TOKEN_PRICE_INTERVAL } from "@/common/constants";
import useInterval from "@/hooks/useInterval";
import { priceService } from "@/services/PriceService";
import useSWR from "swr";
import { type TokenV2 } from "core/types/Token";

const useStatePrice = (uniqueId: ChainUniqueId, contractAddress?: string) => {
  const price = useSelector(
    (state: RootState) =>
      contractAddress
        ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
            contractAddress.toLowerCase()
          ]?.price
        : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.price,
    (prev, next) => isEqual(prev, next),
  );
  return price;
};

const useStateChange = (uniqueId: ChainUniqueId, contractAddress?: string) => {
  const change = useSelector(
    (state: RootState) =>
      contractAddress
        ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
            contractAddress.toLowerCase()
          ]?.change
        : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.change,
    (prev, next) => isEqual(prev, next),
  );
  return change;
};

export const useTokenPrice = (
  uniqueId: ChainUniqueId,
  contractAddress?: string,
) => {
  const dispatch = useDispatch<Dispatch>();
  const price = useStatePrice(uniqueId, contractAddress);
  const change = useStateChange(uniqueId, contractAddress);

  // const price = useSelector(
  //   (state: RootState) =>
  //     contractAddress
  //       ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
  //           contractAddress.toLowerCase()
  //         ]?.price
  //       : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.price,
  //   (prev, next) => isEqual(prev, next),
  // );
  // const change = useSelector(
  //   (state: RootState) =>
  //     contractAddress
  //       ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
  //           contractAddress.toLowerCase()
  //         ]?.change
  //       : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.change,
  //   (prev, next) => isEqual(prev, next),
  // );

  const getAllTokensPrice = useCallback(async () => {
    const priceArray = await priceService.getTokensPrice(uniqueId);
    console.log("      priceArray", priceArray, uniqueId);

    if (priceArray && priceArray?.length > 0) {
      dispatch.coinPriceV2.updateTokensPrice({
        uniqueId,
        exchangeItems: priceArray,
      });
    }
  }, [dispatch.coinPriceV2, uniqueId]);

  const { setTimer, clearTimer } = useInterval(
    getAllTokensPrice,
    POLL_ALL_TOKEN_PRICE_INTERVAL,
  );

  useEffect(() => {
    setTimer();
    return clearTimer;
  }, [setTimer, clearTimer]);

  return {
    price,
    change,
    getAllTokensPrice,
  };
};

// export const useMultiChainPriceOld = (uniqueIds: ChainUniqueId[]) => {
//   const dispatch = useDispatch<Dispatch>();
//
//   const [loading, setLoading] = useState(false);
//
//   const getMultiChainPrices = useCallback(async () => {
//     setLoading(true);
//     try {
//       const priceMap = await priceService.getChainsTokensPrice(uniqueIds);
//       dispatch.coinPriceV2.batchUpdateTokensPrice({
//         exchangeMap: priceMap,
//       });
//     } catch (err) {
//       console.warn("useMultiChainPrice error: ", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [dispatch.coinPriceV2, uniqueIds]);
//
//   const { setTimer, clearTimer } = useInterval(
//     getMultiChainPrices,
//     POLL_ALL_TOKEN_PRICE_INTERVAL,
//   );
//
//   return {
//     getMultiChainPrices,
//     loading,
//     pollPrices: setTimer,
//     stopPollPrices: clearTimer,
//   };
// };

export const useMultiChainPrice = (uniqueIds: ChainUniqueId[]) => {
  const dispatch = useDispatch<Dispatch>();

  const key = useMemo(() => uniqueIds.join("-"), [uniqueIds]);

  const fetchPrice = useCallback(async () => {
    console.log("      fetchMultiChainPrice");
    try {
      const priceMap = await priceService.getChainsTokensPrice(uniqueIds);
      dispatch.coinPriceV2.batchUpdateTokensPrice({
        exchangeMap: priceMap,
      });
    } catch (err) {
      console.warn("useMultiChainPrice error: ", err);
    }
  }, [dispatch.coinPriceV2, uniqueIds]);

  const {
    error,
    mutate: getMultiChainPrice,
    isLoading: loadingMultiChainPrice,
  } = useSWR(key, fetchPrice, {
    refreshInterval: POLL_ALL_TOKEN_PRICE_INTERVAL,
  });

  const res = useMemo(() => {
    return {
      error,
      getMultiChainPrice,
      loadingMultiChainPrice,
    };
  }, [error, getMultiChainPrice, loadingMultiChainPrice]);

  return res;
};

// export const useAssetTokensPrice = (tokens: TokenV2[]) => {
//   const newTokens = tokens.map((token) => {
//     const { uniqueId, contractAddress } = token;
//     const price = useStatePrice(uniqueId, contractAddress);
//     return { ...token, price };
//   });
//   return newTokens;
// };
