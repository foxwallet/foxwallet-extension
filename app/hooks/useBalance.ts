import type { ChainUniqueId } from "core/types/ChainUniqueId";
import useSWR from "swr";
import { useClient } from "./useClient";
import { useCallback, useMemo } from "react";
import { useCoinService } from "./useCoinService";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import { type InnerProgramId } from "core/coins/ALEO/types/ProgramId";

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
  programId,
  tokenId,
  refreshInterval,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  programId: InnerProgramId;
  tokenId?: string;
  refreshInterval?: number;
}) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/balance/${uniqueId}/${programId}/${address}/${tokenId}`;
  const fetchBalance = useCallback(async () => {
    if (programId !== NATIVE_TOKEN_PROGRAM_ID && tokenId) {
      return await coinService.getTokenBalanceOld(address, programId, tokenId);
    }
    return await coinService.getBalance(address);
  }, [coinService, uniqueId, address, tokenId]);

  const {
    data: balance,
    error,
    mutate: getBalance,
    isLoading: loadingBalance,
  } = useSWR(key, fetchBalance, {
    refreshInterval,
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
