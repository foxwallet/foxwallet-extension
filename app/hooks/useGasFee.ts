import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";
import type { GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";
import { type EstimateGasExtraOption } from "core/types/NativeCoinTransaction";

export const useGasFee = <T extends CoinType>(
  uniqueId: ChainUniqueId,
  from: string,
  to: string,
  value: bigint | undefined,
  token?: TokenV2,
  option?: EstimateGasExtraOption<T>,
) => {
  const [gasFee, setGasFee] = useState<GasFee<T> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { coinService } = useCoinService(uniqueId);

  useEffect(() => {
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

        if (token) {
          const res = (await coinService.getTokenEstimateGasFee({
            tx: { from, to, value, token },
            option,
          })) as GasFee<T>;

          setGasFee(res);
        } else {
          const res = (await coinService.estimateGasFee({
            tx: { from, to, value },
          })) as GasFee<T>;

          setGasFee(res);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to estimate gas fee"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGasFee();
  }, [token, uniqueId, coinService, from, to, value, option]);

  return { gasFee, loadingGasFee: loading, error };
};
