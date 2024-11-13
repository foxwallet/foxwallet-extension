export enum InnerChainUniqueId {
  ALEO_MAINNET = "ALEO_MAINNET",
  ETHEREUM = "ethereum",
  BNB = "bnb",
  // TODO other evm

  /**
   * @deprecated
   */
  // ALEO_TESTNET = "ALEO_TESTNET",
}

export const InnerChainUniqueIdValues = Object.values(InnerChainUniqueId);

export type ChainUniqueId = InnerChainUniqueId;

export enum ChainAssembleMode {
  ALL = "all",
  SINGLE = "single",
}

export const EthRpcPrefix = `${InnerChainUniqueId.ETHEREUM}-`;

export type ChainDisplayMode =
  | {
      mode: ChainAssembleMode.ALL;
    }
  | {
      mode: ChainAssembleMode.SINGLE;
      uniqueId: ChainUniqueId;
    };
