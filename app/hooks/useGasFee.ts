import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { type EstimateGasExtraOption } from "core/types/NativeCoinTransaction";
import useSWR from "swr";

export type GasFeeReq<T extends CoinType> = {
  uniqueId: ChainUniqueId;
  from: string;
  to: string;
  value: bigint | undefined;
  token?: TokenV2;
  option?: EstimateGasExtraOption<T>;
  refreshInterval?: number;
};

export const useGasFee = <T extends CoinType>(params: GasFeeReq<T>) => {
  const {
    uniqueId,
    from,
    to,
    value,
    token,
    option,
    refreshInterval = 5000,
  } = params;

  // const [gasFee, setGasFee] = useState<GasFee<T> | undefined>(undefined);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<Error | undefined>(undefined);

  const { coinService } = useCoinService(uniqueId);

  const key = useMemo(() => {
    return `/balance/${[
      uniqueId,
      from,
      to,
      value,
      token?.contractAddress,
      token?.tokenId,
      token?.programId,
    ]
      .filter((item) => !!item)
      .join("/")}`;
  }, [from, to, token, uniqueId, value]);

  const isValidData = useMemo(() => {
    return (
      value &&
      value !== 0n &&
      coinService.validateAddress(from) &&
      coinService.validateAddress(to)
    );
  }, [coinService, from, to, value]);

  const fetchGas = useCallback(async () => {
    if (!isValidData) {
      return undefined;
    }

    try {
      if (token?.type === AssetType.TOKEN) {
        return (await coinService.getTokenEstimateGasFee({
          // @ts-expect-error value is sure to exist
          tx: { from, to, value, token },
          option,
        })) as GasFee<T>;
      } else {
        return (await coinService.estimateGasFee({
          // @ts-expect-error value is sure to exist
          tx: { from, to, value },
        })) as GasFee<T>;
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [coinService, from, isValidData, option, to, token, value]);

  const {
    data: gasFee,
    error,
    mutate: getGasFee,
    isLoading: loadingGasFee,
  } = useSWR(isValidData ? key : null, fetchGas, {
    refreshInterval,
  });

  // useEffect(() => {
  //   if (
  //     !value ||
  //     value === 0n ||
  //     !coinService.validateAddress(from) ||
  //     !coinService.validateAddress(to)
  //   ) {
  //     setGasFee(undefined);
  //     setLoading(false);
  //     setError(new Error("Data error"));
  //     return;
  //   }
  //
  //   const fetchGasFee = async () => {
  //     try {
  //       setLoading(true);
  //
  //       if (token?.type === AssetType.TOKEN) {
  //         const res = (await coinService.getTokenEstimateGasFee({
  //           tx: { from, to, value, token },
  //           option,
  //         })) as GasFee<T>;
  //
  //         setGasFee(res);
  //       } else {
  //         const res = (await coinService.estimateGasFee({
  //           tx: { from, to, value },
  //         })) as GasFee<T>;
  //
  //         setGasFee(res);
  //       }
  //     } catch (err) {
  //       setError(
  //         err instanceof Error ? err : new Error("Failed to estimate gas fee"),
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   fetchGasFee();
  // }, [token, uniqueId, coinService, from, to, value, option]);

  const res = useMemo(() => {
    if (!isValidData) {
      return {
        gasFee: undefined,
        error: new Error("Data error"),
        getGasFee: undefined,
        loadingGasFee: false,
      };
    }
    return {
      gasFee,
      error,
      getGasFee,
      loadingGasFee,
    };
  }, [error, gasFee, getGasFee, isValidData, loadingGasFee]);

  return res;
};
