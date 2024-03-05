import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useMemo } from "react";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import useSWR from "swr";
import { InnerProgramId } from "core/coins/ALEO/types/ProgramId";

export const useAleoGasFee = (
  uniqueId: ChainUniqueId,
  programId: InnerProgramId,
  method: AleoTransferMethod,
) => {
  const { coinService } = useCoinService(uniqueId);

  const key = `/gasFee/${uniqueId}`;
  const fetchBalance = useCallback(async () => {
    return coinService.getGasFee(programId, method);
  }, [coinService, uniqueId, programId, method]);

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
