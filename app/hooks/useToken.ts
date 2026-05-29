import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  BETA_STAKING_ALEO_TOKEN_ID,
  isComplianceProgram,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
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
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import { isSameAddress } from "core/utils/address";

export type AssetIdentifier = {
  uniqueId: ChainUniqueId;
  address: string;
  needUpdate?: boolean;
};

const getAleoProgramId = (token: TokenV2): string | undefined => {
  if (token.programId) {
    return token.programId;
  }
  if (token.contractAddress) {
    const [programId] = token.contractAddress.split("-");
    return programId || undefined;
  }
  return undefined;
};

const mergeStandardTokenMeta = (
  activeTokens: TokenV2[],
  standardTokens: TokenV2[],
): TokenV2[] => {
  if (standardTokens.length === 0) {
    return activeTokens;
  }

  return activeTokens.map((activeToken) => {
    const activeProgramId =
      activeToken.uniqueId === InnerChainUniqueId.ALEO_MAINNET
        ? getAleoProgramId(activeToken)
        : undefined;
    const isAleoCompliance =
      activeToken.uniqueId === InnerChainUniqueId.ALEO_MAINNET &&
      !!activeProgramId &&
      isComplianceProgram(activeProgramId);
    const matched = isAleoCompliance
      ? standardTokens.find((item) => {
          if (item.uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
            return false;
          }
          const itemProgramId = getAleoProgramId(item);
          return !!itemProgramId && itemProgramId === activeProgramId;
        })
      : standardTokens.find((item) =>
          isSameAddress(item.contractAddress, activeToken.contractAddress),
        );
    return matched
      ? {
          ...activeToken,
          ...matched,
          type: activeToken.type,
        }
      : activeToken;
  });
};

export const useTokens = (uniqueId: ChainUniqueId, keyword?: string) => {
  const { coinService } = useCoinService(uniqueId);

  const key = keyword
    ? `/all_tokens/${uniqueId}/${keyword}`
    : `/all_tokens/${uniqueId}`;
  const fetchTokens = useCallback(async () => {
    if (keyword) {
      return await (coinService as AleoService).searchTokens(keyword);
    }
    return await (coinService as AleoService).getAllTokens();
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
    let tokens = await coinService.getUserInteractiveTokens({ address });
    if (!coinService.config.testnet) {
      const allTokens = await getAllTokensWithCache(uniqueId);
      tokens = mergeStandardTokenMeta(tokens, allTokens);
    }
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

export const matchedAndUnMatchedTokens = (
  uniqueId: ChainUniqueId,
  targetTokens: TokenV2[], // 需要分类的tokens, 最后的数量 matched + unMatched = target
  standardTokens?: TokenV2[], // 评判标准
) => {
  const matched: TokenV2[] = [];
  let unMatched: TokenV2[] = [];

  if (standardTokens && standardTokens.length > 0) {
    let contractAddressSet: Set<string>;
    let complianceProgramIdSet: Set<string> = new Set();
    if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
      contractAddressSet = new Set(
        standardTokens.map((token) => {
          if (token.contractAddress) {
            return token.contractAddress.toLowerCase();
          } else if (token.tokenId === BETA_STAKING_ALEO_TOKEN_ID) {
            return `${token.programId}-stAleo`.toLowerCase();
          } else {
            return `${token.programId}-${token.tokenId}`.toLowerCase();
          }
        }) ?? [],
      );
      complianceProgramIdSet = new Set(
        standardTokens
          .map((token) => getAleoProgramId(token))
          .filter(
            (programId): programId is string =>
              !!programId && isComplianceProgram(programId),
          )
          .map((programId) => programId.toLowerCase()),
      );
    } else {
      contractAddressSet = new Set(
        standardTokens.map((token) => token.contractAddress.toLowerCase()) ??
          [],
      );
    }
    targetTokens.forEach((t) => {
      const matchedByAddress = contractAddressSet.has(
        t.contractAddress.toLowerCase(),
      );
      const tProgramId =
        uniqueId === InnerChainUniqueId.ALEO_MAINNET
          ? getAleoProgramId(t)
          : undefined;
      const matchedByComplianceProgram =
        !!tProgramId &&
        isComplianceProgram(tProgramId) &&
        complianceProgramIdSet.has(tProgramId.toLowerCase());
      if (matchedByAddress || matchedByComplianceProgram) {
        matched.push(t);
      } else {
        unMatched.push(t);
      }
    });
  } else {
    unMatched = targetTokens;
  }
  return { matchedTokens: matched, unMatchedTokens: unMatched };
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

      const userInteractiveTokens = await coinService.getUserInteractiveTokens({
        address,
      });
      // console.log("      userInteractiveTokens", userInteractiveTokens);

      const allTokens = await getAllTokensWithCache(uniqueId);
      const whiteTokens = allTokens.filter(
        (it) => it?.security === TokenSecurity.WHITE,
      );
      const { matchedTokens, unMatchedTokens } = matchedAndUnMatchedTokens(
        uniqueId,
        userInteractiveTokens,
        whiteTokens,
      );
      const trustedUnmatched = unMatchedTokens.filter(
        (t) => t?.security === TokenSecurity.WHITE,
      );
      const tokens = mergeStandardTokenMeta(
        [...matchedTokens, ...trustedUnmatched],
        whiteTokens,
      );
      // console.log("      selectedTokens", selectedTokens);
      return { address, uniqueId, tokens };
    });
    const results = await Promise.allSettled(promises);
    const validResults = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
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
