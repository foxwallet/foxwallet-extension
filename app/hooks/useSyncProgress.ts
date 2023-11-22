import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";

export const useSyncProgress = (uniqueId: ChainUniqueId, address: string) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/progress/${uniqueId}/${address}`;
  const fetchProgress = useCallback(async () => {
    return coinService.getSyncProgress(address);
  }, [coinService, uniqueId, address]);

  const {
    data: progress,
    error,
    mutate: getProgress,
    isLoading: loadingProgress,
  } = useSWR(key, fetchProgress, {
    refreshInterval: 2000,
  });

  const res = useMemo(() => {
    return {
      progress,
      error,
      getProgress,
      loadingProgress,
    };
  }, [progress, error, getProgress, loadingProgress]);

  return res;
};
