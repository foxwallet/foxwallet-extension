import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";

export const uniqueIdToAleoChainId = (uniqueId: ChainUniqueId) => {
  switch (uniqueId) {
    // case InnerChainUniqueId.ALEO_TESTNET: {
    //   return "testnet";
    // }
    case InnerChainUniqueId.ALEO_MAINNET: {
      return "mainnet";
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown uniqueId: ${uniqueId}`);
    }
  }
};
