import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";

export const uniqueIdToAleoChainId = (uniqueId: ChainUniqueId) => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET3: {
      return "testnet3";
    }
    default: {
      throw new Error(`Unknown uniqueId: ${uniqueId}`);
    }
  }
};
