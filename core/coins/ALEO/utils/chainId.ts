import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";

export const uniqueIdToAleoChainId = (uniqueId: ChainUniqueId) => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET: {
      return "testnet";
    }
    default: {
      throw new Error(`Unknown uniqueId: ${uniqueId}`);
    }
  }
};
