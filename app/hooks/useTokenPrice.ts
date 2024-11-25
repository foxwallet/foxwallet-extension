import { type Dispatch, type RootState } from "@/store/store";
import { isEqual } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { POLL_ALL_TOKEN_PRICE_INTERVAL } from "@/common/constants";
import useInterval from "@/hooks/useInterval";
import { priceService } from "@/services/PriceService";

export const useTokenPrice = (
  uniqueId: ChainUniqueId,
  contractAddress?: string,
) => {
  const dispatch = useDispatch<Dispatch>();

  const price = useSelector(
    (state: RootState) =>
      contractAddress
        ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
            contractAddress.toLowerCase()
          ]?.price
        : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.price,
    (prev, next) => isEqual(prev, next),
  );
  const change = useSelector(
    (state: RootState) =>
      contractAddress
        ? state.coinPriceV2.prices[uniqueId]?.tokens?.[
            contractAddress.toLowerCase()
          ]?.change
        : state.coinPriceV2.prices[uniqueId]?.baseCurrency?.change,
    (prev, next) => isEqual(prev, next),
  );

  const getAllTokensPrice = useCallback(async () => {
    const priceArray = await priceService.getTokensPrice(uniqueId);
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

export const useMultiChainPrice = (uniqueIds: ChainUniqueId[]) => {
  const dispatch = useDispatch<Dispatch>();

  const [loading, setLoading] = useState(false);

  const getMultiChainPrices = useCallback(async () => {
    setLoading(true);
    try {
      const priceMap = await priceService.getChainsTokensPrice(uniqueIds);
      dispatch.coinPriceV2.batchUpdateTokensPrice({
        exchangeMap: priceMap,
      });
    } catch (err) {
      console.warn("useMultiChainPrice error: ", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch.coinPriceV2, uniqueIds]);

  const { setTimer, clearTimer } = useInterval(
    getMultiChainPrices,
    POLL_ALL_TOKEN_PRICE_INTERVAL,
  );

  return {
    getMultiChainPrices,
    loading,
    pollPrices: setTimer,
    stopPollPrices: clearTimer,
  };
};
