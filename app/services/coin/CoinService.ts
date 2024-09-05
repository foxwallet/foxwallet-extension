import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

// If support user config, get chain config map from store
const ChainConfigMap = {
  [InnerChainUniqueId.ALEO_TESTNET]: ALEO_CHAIN_CONFIGS.TESTNET,
  [InnerChainUniqueId.ALEO_MAINNET]: ALEO_CHAIN_CONFIGS.MAINNET,
};

export const coinServiceEntry = new CoinServiceEntry(ChainConfigMap);
