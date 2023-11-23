import { CoinType } from "core/types";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";

export const convertChainUniqueIdToCoinType = (
  uniqueId: ChainUniqueId,
): CoinType => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET_3:
      return CoinType.ALEO;
    default: {
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};
