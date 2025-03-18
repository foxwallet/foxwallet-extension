export enum InnerChainUniqueId {
  ALEO_MAINNET = "aleo_mainnet",
  ALEO_TESTNET = "aleo_testnet",
  ETHEREUM = "ethereum",
  ARBITRUM = "arbitrum",
  ARBITRUM_NOVA = "arbitrum-nova",
  AREON = "areon",
  AVAX = "avax",
  BAHAMUT = "bahamut",
  BASE = "base",
  BITGERT = "bitgert",
  BITLAYER = "bitlayer",
  BOBA = "boba",
  BLAST = "blast",
  CELO = "celo",
  BNB = "bnb",
  FILECOIN_EVM = "filecoin-evm",
  POLYGON = "polygon",
  POLYGON_ZKEVM = "polygon-zkevm",
  NEAR = "near",
  OKX = "okx",
  OPTIMISM = "optimism",

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
