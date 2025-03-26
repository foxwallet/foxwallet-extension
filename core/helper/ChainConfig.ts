import { CoinType } from "core/types";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { chainUniqueIdToCoinType, INNER_CHAIN_CONFIG } from "./CoinType";
import { INNER_ALEO_CONFIG } from "core/coins/ALEO/config/chains";
import { INNER_ETH_CONFIG } from "core/coins/ETH/config/chains";

export const getInnerChainConfig = ({
  coinType,
  uniqueId,
}: {
  coinType?: CoinType;
  uniqueId: ChainUniqueId;
}): ChainBaseConfig | undefined => {
  let type = coinType;
  if (!type) {
    type = chainUniqueIdToCoinType(uniqueId);
  }
  switch (type) {
    case CoinType.ETH:
      return INNER_ETH_CONFIG.find((item) => item.uniqueId === uniqueId);
    case CoinType.ALEO:
      return INNER_ALEO_CONFIG.find((item) => item.uniqueId === uniqueId);
    default:
      throw new Error(`Unsupported coin type ${coinType}`);
  }
};

export const getInnerChainConfigByFilter = ({
  filter,
}: {
  filter: (config: ChainBaseConfig) => boolean;
}): ChainBaseConfig[] => {
  return INNER_CHAIN_CONFIG.filter(filter);
};
