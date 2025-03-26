export enum InnerChainUniqueId {
  ALEO_MAINNET = "aleo_mainnet",
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
  BSQUARED = "bsquared",
  CAGA = "caga",
  CELO = "celo",
  CORE = "core",
  CRO = "cro",
  BNB = "bnb",
  EOS_EVM = "eos-evm",
  FANTOM = "fantom",
  FILECOIN_EVM = "filecoin-evm",
  GNOSIS = "gnosis",
  INEVM = "inevm",
  JOC = "joc",
  KAVA = "kava",
  LINEA = "linea",
  LUMIA = "lumia",
  MANTLE = "mantle",
  MORPH = "morph",
  POLYGON = "polygon",
  POLYGON_ZKEVM = "polygon-zkevm",
  NEAR = "near",
  OKX = "okx",
  OPTIMISM = "optimism",
  SCROLL = "scroll",
  TAIKO = "taiko",
  ZCHAINS = "zchains",
  ZKSYNC_ERA = "zksync-era",

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
