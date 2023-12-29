import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import useSWR from "swr";

export const useAleoGasFee = (
  uniqueId: ChainUniqueId,
  method: AleoTransferMethod,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/gasFee/${uniqueId}`;
  const fetchBalance = useCallback(async () => {
    return coinService.getGasFee(method);
  }, [coinService, uniqueId, method]);

  const {
    data: gasFee,
    error,
    mutate: getGasFee,
    isLoading: loadingGasFee,
  } = useSWR(key, fetchBalance);

  const res = useMemo(() => {
    return {
      gasFee,
      error,
      getGasFee,
      loadingGasFee,
    };
  }, [gasFee, error, getGasFee, loadingGasFee]);

  return res;
};
