import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

export const useTxHistory = (
  uniqueId: ChainUniqueId,
  address: string,
  refreshInterval?: number,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/history/${uniqueId}/${address}`;

  const getTxHistory = useCallback(async () => {
    const res = await coinService.getTxHistory(address);
    return res;
  }, [coinService, address]);

  const {
    data: history,
    error,
    mutate: getHistory,
    isLoading: loading,
  } = useSWR(key, getTxHistory, {
    refreshInterval,
  });

  return {
    loading,
    error,
    history,
    getHistory,
  };
};
