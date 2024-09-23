import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AccountOption } from "core/types/CoinBasic";

export const DEFAULT_CHAIN_UNIQUE_ID: {
  [key in CoinType]: InnerChainUniqueId;
} = {
  [CoinType.ALEO]: InnerChainUniqueId.ALEO_MAINNET,
};

export const DEFAULT_USER_SELECTED_CHAINS = [InnerChainUniqueId.ALEO_MAINNET];

export const getDefaultChainUniqueId = (
  coinType: CoinType,
  option: AccountOption[CoinType],
) => {
  switch (coinType) {
    case CoinType.ALEO:
      return InnerChainUniqueId.ALEO_MAINNET;
    default:
      throw new Error(`getDefaultChainUniqueId for ${coinType}`);
  }
};
