import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { type AleoService } from "core/coins/ALEO/service/AleoService";

export const useSyncProgress = (uniqueId: ChainUniqueId, address?: string) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/progress/${uniqueId}/${address}`;
  const fetchProgress = useCallback(async () => {
    if (address) {
      return (coinService as AleoService).getSyncProgress(address);
    }
  }, [coinService, address]);

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
