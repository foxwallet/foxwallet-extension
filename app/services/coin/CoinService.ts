import { type RootState, store } from "@/store/store";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { ETH_CHAIN_CONFIGS } from "core/coins/ETH/config/chains";
import { getInnerChainConfig } from "core/helper/ChainConfig";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";

// If support user config, get chain config map from store
const ChainConfigMap = {
  // [InnerChainUniqueId.ALEO_TESTNET]: ALEO_CHAIN_CONFIGS.TESTNET,
  [InnerChainUniqueId.ALEO_MAINNET]: ALEO_CHAIN_CONFIGS.MAINNET,
  [InnerChainUniqueId.ETHEREUM]: ETH_CHAIN_CONFIGS.MAINNET,
};

export const getChainConfig = ({
  state,
  uniqueId,
}: {
  state?: RootState;
  uniqueId: ChainUniqueId;
}) => {
  let currState = state;
  if (!currState) {
    currState = store.getState();
  }
  const config = currState.multiChain.chainConfigItems?.filter(
    (item) => item.uniqueId === uniqueId,
  )[0];
  return mergeLocalChainConfig(uniqueId, config);
};

export const mergeLocalChainConfig = (
  uniqueId: ChainUniqueId,
  chainConfig?: ChainBaseConfig,
) => {
  const innerConfig = getInnerChainConfig({ uniqueId });
  if (!innerConfig && !chainConfig) {
    throw new Error(
      "Can't find chainConfig & innerChainConfig for " + uniqueId,
    );
  }
  if (!chainConfig) {
    return innerConfig!;
  }
  if (!innerConfig) {
    return chainConfig;
  }
  return {
    ...innerConfig,
    rpcList: chainConfig.rpcList,
    chainName: chainConfig.chainName,
  };
};
