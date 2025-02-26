export enum InnerChainUniqueId {
  ALEO_MAINNET = "aleo_mainnet",
  ETHEREUM = "ethereum",
  BNB = "bnb",
  FILECOIN_EVM = "filecoin-evm",
  SEPOLIA = "sepolia",
  // TODO other evm

  /**
   * @deprecated
   */
  // ALEO_TESTNET = "ALEO_TESTNET",
}

export const InnerChainUniqueIdValues = Object.values(InnerChainUniqueId);

export type EthCustomRPCUniqueId = `${InnerChainUniqueId.ETHEREUM}-${number}`;

export type ChainUniqueId = InnerChainUniqueId | EthCustomRPCUniqueId;

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
