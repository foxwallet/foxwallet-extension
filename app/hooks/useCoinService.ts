import { coinServiceEntry } from "@/services/coin/CoinService";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { coinBasicFactory } from "core/coins/CoinBasicFactory";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { convertChainUniqueIdToCoinType } from "core/helper/CoinType";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useMemo } from "react";

export const useCoinBasic = (uniqueId: ChainUniqueId) => {
  const coinType = useMemo(() => {
    return convertChainUniqueIdToCoinType(uniqueId);
  }, [uniqueId]);

  const coinBasic = useMemo(() => {
    return coinBasicFactory(coinType);
  }, [coinType]);

  return coinBasic;
};

export const useCoinService = (uniqueId: ChainUniqueId) => {
  const coinService = useMemo(() => {
    return coinServiceEntry.getInstance(uniqueId);
  }, [uniqueId]);

  const chainConfig = useMemo(() => {
    return {
      ...coinService.config,
    };
  }, [coinService]);

  const nativeCurrency = useMemo(() => {
    return {
      ...chainConfig.nativeCurrency,
    };
  }, [chainConfig]);

  return { coinService, chainConfig, nativeCurrency };
};
