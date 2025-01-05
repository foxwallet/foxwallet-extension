import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { type InnerProgramId } from "core/coins/ALEO/types/ProgramId";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { isEqual } from "lodash";
import { tokenService } from "@/services/TokenService";
import {
  NON_TOKEN_POLL_ALL_TOKEN_INTERVAL,
  POLL_ALL_TOKEN_INTERVAL,
} from "@/common/constants";
import { TokenSecurity, type TokenV2 } from "core/types/Token";
import { CacheType, withCache } from "@/common/utils/cache";

export type AssetIdentifier = {
  uniqueId: ChainUniqueId;
  address: string;
  needUpdate?: boolean;
};

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
    const itemsToUpdate = data.filter((item) => item.needUpdate !== false);
    const promises = itemsToUpdate.map(async (item) => {
      const { uniqueId, address } = item;
      const coinService = coinServiceEntry.getInstance(uniqueId);
      const tokens = await coinService.getUserInteractiveTokens({ address });
      return { address, uniqueId, tokens };
    });
    const results = await Promise.allSettled(promises);
    const validResults = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
    console.log("      validResults", validResults);

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

  return {
    groupInteractiveTokens,
    error,
    getGroupInteractiveTokens,
    loadingGroupInteractiveTokens,
  };
};

// export const useTokenInfo = (
//   uniqueId: ChainUniqueId,
//   programId: InnerProgramId,
//   tokenId?: string | null,
// ) => {
//   const { coinService } = useCoinService(uniqueId);
//
//   const key = `/token_info/${uniqueId}/${tokenId}`;
//   const fetchTokens = useCallback(async () => {
//     if (!tokenId || tokenId === NATIVE_TOKEN_TOKEN_ID) {
//       return ALEO_NATIVE_TOKEN;
//     }
//     return await coinService.getTokenInfo(programId, tokenId);
//   }, [coinService, programId, tokenId]);
//
//   const {
//     data: tokenInfo,
//     error,
//     mutate: getTokenInfo,
//     isLoading: loadingTokenInfo,
//   } = useSWR(key, fetchTokens);
//
//   const res = useMemo(() => {
//     return {
//       tokenInfo,
//       error,
//       getTokenInfo,
//       loadingTokenInfo,
//     };
//   }, [tokenInfo, error, getTokenInfo, loadingTokenInfo]);
//
//   return res;
// };

export const useRecommendTokens = (uniqueId: ChainUniqueId) => {
  const key = `/recommendTokens/${uniqueId}`;

  const getRecommendTokens = useCallback(async () => {
    const recommendTokens = await tokenService.getRecommend(uniqueId);
    if (recommendTokens && recommendTokens.length > 0) {
      return recommendTokens;
    }
    return [];
  }, [uniqueId]);

  const { data: recommendTokens, mutate: _fetchRecommendTokens } = useSWR(
    key,
    getRecommendTokens,
    {
      refreshInterval: (latestData) =>
        !latestData || latestData.length === 0
          ? NON_TOKEN_POLL_ALL_TOKEN_INTERVAL
          : POLL_ALL_TOKEN_INTERVAL,
      fallbackData: [],
      compare: isEqual,
    },
  );

  return recommendTokens;
};

async function getAllTokens(uniqueId: ChainUniqueId): Promise<TokenV2[]> {
  // 目前只有 aleo 支持 tokenList, aleo 目前只有部分，后面统一从后端读
  const allTokens = await tokenService.getAllTokens(uniqueId);
  if (allTokens && allTokens.length > 0) {
    return allTokens;
  }
  return [];
}

export const getAllTokensWithCache = withCache<
  Parameters<typeof getAllTokens>,
  TokenV2[]
>({
  cacheType: CacheType.ARRAY,
  cacheKeyGenerator: (uniqueId) => `/allTokens/${uniqueId}`,
  maxAge: 60 * 30,
})(getAllTokens);

export const useAllTokens = (uniqueId: ChainUniqueId) => {
  const [allTokens, setAllTokens] = useState<TokenV2[]>([]);

  const fetchAllTokens = useCallback(async () => {
    const res = await getAllTokensWithCache(uniqueId);
    setAllTokens(res);
  }, [uniqueId]);

  useEffect(() => {
    fetchAllTokens();
  }, [fetchAllTokens]);

  return allTokens;
};

export const useAllWhiteTokens = (uniqueId: ChainUniqueId) => {
  const allTokens = useAllTokens(uniqueId);
  return useMemo(
    () => allTokens.filter((it) => it?.security === TokenSecurity.WHITE),
    [allTokens],
  );
};
