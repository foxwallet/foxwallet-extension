import type { ChainUniqueId } from "core/types/ChainUniqueId";
import useSWR from "swr";
import { useClient } from "./useClient";
import { useCallback, useMemo } from "react";
import { useCoinService } from "./useCoinService";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";

export interface Balance {
  privateBalance: bigint;
  publicBalance: bigint;
  total: bigint;
}

/**
 *
 * @param uniqueId ChainUniqueId
 * @param address string
 * @param refreshInterval the refresh interval, should be greater than SYNS_BLOCK_INTERVAL
 * @returns {Balance} balance
 */
export const useBalance = ({
  uniqueId,
  address,
  tokenId,
  refreshInterval,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  tokenId?: string;
  refreshInterval?: number;
}) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/balance/${uniqueId}/${address}/${tokenId}`;
  const fetchBalance = useCallback(async () => {
    if (tokenId && tokenId !== NATIVE_TOKEN_TOKEN_ID) {
      return await coinService.getTokenBalance(address, tokenId);
    }
    return await coinService.getBalance(address);
  }, [coinService, uniqueId, address, tokenId]);

  const {
    data: balance,
    error,
    mutate: getBalance,
    isLoading: loadingBalance,
  } = useSWR(key, fetchBalance, {
    refreshInterval: refreshInterval,
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
