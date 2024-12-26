import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { type InnerProgramId } from "core/coins/ALEO/types/ProgramId";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";

export type AssetIdentifier = { uniqueId: ChainUniqueId; address: string };

export const useTokens = (uniqueId: ChainUniqueId, keyword?: string) => {
  const { coinService } = useCoinService(uniqueId);

  const key = keyword
    ? `/all_tokens/${uniqueId}/${keyword}`
    : `/all_tokens/${uniqueId}`;
  const fetchTokens = useCallback(async () => {
    if (keyword) {
      return await coinService.searchTokens(keyword);
    }
    return await coinService.getAllTokens();
  }, [coinService, keyword]);

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
  autoRequest: boolean = true,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/interactive_token/${uniqueId}`;
  const fetchTokens = useCallback(async () => {
    const tokens = await coinService.getUserInteractiveTokens({ address });
    return { address, uniqueId, tokens };
  }, [coinService, address, uniqueId]);

  const {
    data: interactiveTokens,
    error,
    mutate: getUserInteractiveTokens,
    isLoading: loadingInteractiveTokens,
  } = useSWR(key, fetchTokens, {
    revalidateIfStale: autoRequest,
    revalidateOnFocus: autoRequest,
    revalidateOnMount: autoRequest,
    revalidateOnReconnect: autoRequest,
  });

  const res = useMemo(() => {
    return {
      interactiveTokens,
      error,
      getUserInteractiveTokens,
      loadingInteractiveTokens,
    };
  }, [
    interactiveTokens,
    error,
    getUserInteractiveTokens,
    loadingInteractiveTokens,
  ]);

  return res;
};

export const useGroupInteractiveTokens = (
  data: AssetIdentifier[],
  autoRequest: boolean = true,
) => {
  const fetchTokens = useCallback(async () => {
    const promises = data.map(async (item) => {
      const { uniqueId, address } = item;
      const coinService = coinServiceEntry.getInstance(uniqueId);
      const res = await coinService.getUserInteractiveTokens({ address });
      return { address, uniqueId, tokens: res };
    });
    const results = await Promise.allSettled(promises);
    const validResults = results.filter((r) => r.status === "fulfilled");
    // console.log("      validResults", validResults);

    return validResults;
  }, [data]);

  const key = useMemo(() => {
    const sortedData = [...data].sort(
      (a, b) =>
        a.uniqueId.localeCompare(b.uniqueId) ||
        a.address.localeCompare(b.address),
    );
    return `/group_interactive_tokens/${JSON.stringify(sortedData)}`;
  }, [data]);

  const {
    data: groupInteractiveTokens,
    error,
    mutate: getGroupInteractiveTokens,
    isLoading: loadingGroupInteractiveTokens,
  } = useSWR(key, fetchTokens, {
    revalidateIfStale: autoRequest,
    revalidateOnFocus: autoRequest,
    revalidateOnMount: autoRequest,
    revalidateOnReconnect: autoRequest,
  });

  const res = useMemo(() => {
    return {
      groupInteractiveTokens,
      error,
      getGroupInteractiveTokens,
      loadingGroupInteractiveTokens,
    };
  }, [
    groupInteractiveTokens,
    error,
    getGroupInteractiveTokens,
    loadingGroupInteractiveTokens,
  ]);

  return res;
};

export const useTokenInfo = (
  uniqueId: ChainUniqueId,
  programId: InnerProgramId,
  tokenId?: string | null,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/token_info/${uniqueId}/${tokenId}`;
  const fetchTokens = useCallback(async () => {
    if (!tokenId || tokenId === NATIVE_TOKEN_TOKEN_ID) {
      return ALEO_NATIVE_TOKEN;
    }
    return await coinService.getTokenInfo(programId, tokenId);
  }, [coinService, programId, tokenId]);

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
