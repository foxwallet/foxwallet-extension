import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type FeeData, type GasFee, type GasFeeType } from "core/types/GasFee";
import { CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { type EstimateGasExtraOption } from "core/types/NativeCoinTransaction";
import useSWR from "swr";
import { useChainConfig } from "@/hooks/useGroupAccount";

export type GasFeeReq<T extends CoinType> = {
  uniqueId: ChainUniqueId;
  from: string;
  to: string;
  value: bigint | undefined;
  token?: TokenV2;
  option?: EstimateGasExtraOption<T>;
  refreshInterval?: number;
  data?: string;
};

export const useGasFee = <T extends CoinType>(params: GasFeeReq<T>) => {
  const {
    uniqueId,
    from,
    to,
    value,
    token,
    option,
    refreshInterval = 1 * 60 * 1000,
    data,
  } = params;

  const { coinService, chainConfig } = useCoinService(uniqueId);

  const key = useMemo(() => {
    return `/balance/${[
      uniqueId,
      from,
      to,
      value,
      data,
      token?.contractAddress,
      token?.tokenId,
      token?.programId,
    ]
      .filter((item) => !!item)
      .join("/")}`;
  }, [from, to, token, uniqueId, value, data]);

  const isValidData = useMemo(() => {
    if (value === undefined) {
      return false;
    }
    return (
      value >= 0n &&
      coinService.validateAddress(from) &&
      coinService.validateAddress(to) &&
      chainConfig.coinType === CoinType.ETH
    );
  }, [chainConfig.coinType, coinService, from, to, value]);
  // console.log("isValidData", isValidData);

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
          tx: { from, to, value, data },
        })) as GasFee<T>;
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [coinService, from, isValidData, option, to, token, value, data]);

  const {
    data: gasFee,
    error,
    mutate: getGasFee,
    isLoading: loadingGasFee,
  } = useSWR(isValidData ? key : null, fetchGas, {
    refreshInterval,
  });

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

export const useNetworkFeeData = (uniqueId: ChainUniqueId) => {
  const { supportFeeData, coinService } = useChainConfig(uniqueId);
  const [networkFeeData, setNetworkFeeData] = useState<
    FeeData<GasFeeType> | undefined
  >(undefined);

  useEffect(() => {
    const getFeeData = async () => {
      const feeDataRes = await coinService.getFeeData();
      if (feeDataRes) {
        setNetworkFeeData(feeDataRes);
      }
    };
    if (supportFeeData) {
      getFeeData();
    }
  }, [coinService, supportFeeData, uniqueId]);

  return networkFeeData;
};
