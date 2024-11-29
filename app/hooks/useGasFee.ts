import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";
import type { GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";

export const useGasFee = (
  uniqueId: ChainUniqueId,
  from: string,
  to: string,
  value: bigint,
) => {
  const [gasFee, setGasFee] = useState<GasFee<CoinType.ETH>>();
  const [loadingGasFee, setLoadingGasFee] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { coinService } = useCoinService(uniqueId);

  useEffect(() => {
    const fetchGasFee = async () => {
      try {
        setLoadingGasFee(true);
        const res = (await coinService.estimateGasFee({
          tx: { from, to, value },
        })) as GasFee<CoinType.ETH>;

        setGasFee(res);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch gas fee"),
        );
      } finally {
        setLoadingGasFee(false);
      }
    };

    fetchGasFee();
  }, [uniqueId, coinService, from, to, value]);

  return { gasFee, loadingGasFee, error };
};
