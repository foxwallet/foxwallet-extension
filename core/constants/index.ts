import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export const DEFAULT_UNIQUE_ID_MAP: { [key in CoinType]: InnerChainUniqueId } =
  {
    [CoinType.ALEO]: InnerChainUniqueId.ALEO_TESTNET3,
  };
