import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";
import type { GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";

export const useGasFee = (
  uniqueId: ChainUniqueId,
  from: string,
  to: string,
  value: bigint | undefined,
) => {
  const [gasFee, setGasFee] = useState<GasFee<CoinType.ETH> | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { coinService } = useCoinService(uniqueId);

  useEffect(() => {
    // console.log("      value " + value);

    if (
      !value ||
      value === 0n ||
      !coinService.validateAddress(from) ||
      !coinService.validateAddress(to)
    ) {
      setGasFee(undefined);
      setLoading(false);
      setError(new Error("Data error"));
      return;
    }

    const fetchGasFee = async () => {
      try {
        setLoading(true);
        const estimatedGasFee = (await coinService.estimateGasFee({
          tx: { from, to, value },
        })) as GasFee<CoinType.ETH>;

        setGasFee(estimatedGasFee);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to estimate gas fee"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGasFee();
  }, [uniqueId, coinService, from, to, value]);

  return { gasFee, loadingGasFee: loading, error };
};
