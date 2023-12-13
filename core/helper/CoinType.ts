import { CoinType } from "core/types";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";

export const chainUniqueIdToCoinType = (uniqueId: ChainUniqueId): CoinType => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET3:
      return CoinType.ALEO;
    default: {
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};
