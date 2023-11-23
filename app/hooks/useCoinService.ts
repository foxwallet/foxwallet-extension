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

// If support user config, get chain config map from redux
const ChainConfigMap = {
  [InnerChainUniqueId.ALEO_TESTNET_3]: ALEO_CHAIN_CONFIGS.TEST_NET_3,
};

export const coinServiceEntry = new CoinServiceEntry(ChainConfigMap);

export const useCoinService = (uniqueId: ChainUniqueId) => {
  const coinService = useMemo(() => {
    return coinServiceEntry.getInstance(uniqueId);
  }, [uniqueId]);

  return coinService;
};
