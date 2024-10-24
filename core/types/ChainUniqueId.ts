export enum InnerChainUniqueId {
  ALEO_MAINNET = "ALEO_MAINNET",

  /**
   * @deprecated
   */
  // ALEO_TESTNET = "ALEO_TESTNET",
}

export type ChainUniqueId = InnerChainUniqueId;

export enum ChainAssembleMode {
  ALL = "all",
  SINGLE = "single",
}

export type ChainDisplayMode =
  | {
      mode: ChainAssembleMode.ALL;
    }
  | {
      mode: ChainAssembleMode.SINGLE;
      uniqueId: ChainUniqueId;
    };
