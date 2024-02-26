import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";

export const useAllTokens = (uniqueId: ChainUniqueId) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/all_tokens/${uniqueId}`;
  const fetchTokens = useCallback(async () => {
    return await coinService.getAllToken();
  }, [coinService]);

  const {
    data: tokens,
    error,
    mutate: getTokens,
    isLoading: loadingTokens,
  } = useSWR(key, fetchTokens);

  const res = useMemo(() => {
    return {
      tokens,
      error,
      getTokens,
      loadingTokens,
    };
  }, [tokens, error, getTokens, loadingTokens]);

  return res;
};

export const useInteractiveTokens = (
  uniqueId: ChainUniqueId,
  address: string,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/interactive_token/${uniqueId}`;
  const fetchTokens = useCallback(async () => {
    return await coinService.getInteractiveTokens(address);
  }, [coinService, address]);

  const {
    data: interactiveTokens,
    error,
    mutate: getInteractiveTokens,
    isLoading: loadingInteractiveTokens,
  } = useSWR(key, fetchTokens);

  const res = useMemo(() => {
    return {
      interactiveTokens,
      error,
      getInteractiveTokens,
      loadingInteractiveTokens,
    };
  }, [
    interactiveTokens,
    error,
    getInteractiveTokens,
    loadingInteractiveTokens,
  ]);

  return res;
};

export const useTokenInfo = (uniqueId: ChainUniqueId, tokenId: string) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/token_info/${uniqueId}/${tokenId}`;
  const fetchTokens = useCallback(async () => {
    return await coinService.getTokenInfo(tokenId);
  }, [coinService, tokenId]);

  const {
    data: tokenInfo,
    error,
    mutate: getTokenInfo,
    isLoading: loadingTokenInfo,
  } = useSWR(key, fetchTokens);

  const res = useMemo(() => {
    return {
      tokenInfo,
      error,
      getTokenInfo,
      loadingTokenInfo,
    };
  }, [tokenInfo, error, getTokenInfo, loadingTokenInfo]);

  return res;
};
