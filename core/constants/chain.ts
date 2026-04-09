import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AccountOption } from "core/types/CoinBasic";
import { INNER_CHAIN_CONFIG } from "core/helper/CoinType";

export const DEFAULT_CHAIN_UNIQUE_ID: {
  [key in CoinType]: InnerChainUniqueId;
} = {
  [CoinType.ALEO]: InnerChainUniqueId.ALEO_MAINNET,
  [CoinType.ETH]: InnerChainUniqueId.ETHEREUM,
  [CoinType.QTUM]: InnerChainUniqueId.QTUM,
};

export const DEFAULT_USER_SELECTED_CHAINS = Object.values(INNER_CHAIN_CONFIG)
  .filter((item) => item.autoAdd)
  .map((item) => item.uniqueId);

export const getDefaultChainUniqueId = (
  coinType: CoinType,
  option: AccountOption[CoinType],
) => {
  switch (coinType) {
    case CoinType.ALEO:
      return InnerChainUniqueId.ALEO_MAINNET;
    case CoinType.ETH:
      return InnerChainUniqueId.ETHEREUM;
    case CoinType.QTUM:
      return InnerChainUniqueId.QTUM;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`getDefaultChainUniqueId for ${coinType}`);
  }
};
