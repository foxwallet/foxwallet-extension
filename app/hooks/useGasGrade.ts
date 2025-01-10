import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";

const SWR_GAS_GRADE_KEY = `estimate/gasGrade`;

export const useGasGrade = (uniqueId: ChainUniqueId) => {
  const { coinService } = useCoinService(uniqueId);
  const key = [SWR_GAS_GRADE_KEY, uniqueId];

  const fetchGrade = useCallback(
    async ([_url, uniqueId]: [string, ChainUniqueId]) => {
      if (!coinService.supportGasGrade()) {
        return;
      }
      return await coinService.getGasGradeData();
    },
    [coinService],
  );

  const {
    data: gasGrade,
    error,
    mutate: getGasGrade,
    isLoading: loadingGasGrade,
  } = useSWR(key, fetchGrade, {
    refreshInterval: 4000,
  });

  const res = useMemo(() => {
    return {
      gasGrade,
      error,
      getGasGrade,
      loadingGasGrade,
    };
  }, [error, gasGrade, getGasGrade, loadingGasGrade]);

  return res;
};
