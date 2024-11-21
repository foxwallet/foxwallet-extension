import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AccountOption } from "core/types/CoinBasic";

export const DEFAULT_CHAIN_UNIQUE_ID: {
  [key in CoinType]: InnerChainUniqueId;
} = {
  [CoinType.ALEO]: InnerChainUniqueId.ALEO_MAINNET,
  [CoinType.ETH]: InnerChainUniqueId.ETHEREUM,
};

export const DEFAULT_USER_SELECTED_CHAINS = [InnerChainUniqueId.ALEO_MAINNET];

export const getDefaultChainUniqueId = (
  coinType: CoinType,
  option: AccountOption[CoinType],
) => {
  switch (coinType) {
    case CoinType.ALEO:
      return InnerChainUniqueId.ALEO_MAINNET;
    case CoinType.ETH:
      return InnerChainUniqueId.ETHEREUM;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`getDefaultChainUniqueId for ${coinType}`);
  }
};
