import type { ChainUniqueId } from "core/types/ChainUniqueId";
import useSWR from "swr";
import { useClient } from "./useClient";
import { useCallback, useMemo } from "react";
import { useCoinService } from "./useCoinService";

export interface Balance {
  privateBalance: bigint;
  publicBalance: bigint;
  total: bigint;
}

export const useBalance = (uniqueId: ChainUniqueId, address: string) => {
  const coinService = useCoinService(uniqueId);

  const key = `/balance/${uniqueId}/${address}`;
  const fetchBalance = useCallback(async () => {
    return coinService.getBalance(address);
  }, [coinService, uniqueId, address]);

  const {
    data: balance,
    error,
    mutate: getBalance,
    isLoading: loadingBalance,
  } = useSWR(key, fetchBalance, {
    refreshInterval: 3000,
  });

  const res = useMemo(() => {
    return {
      balance,
      error,
      getBalance,
      loadingBalance,
    };
  }, [balance, error, getBalance, loadingBalance]);

  return res;
};
