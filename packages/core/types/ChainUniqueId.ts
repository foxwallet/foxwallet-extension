export enum InnerChainUniqueId {
  ETHEREUM = "ethereum",
  BNB = "bnb",
  ETC = "etc",
  ARBITRUM = "arbitrum",
  ARBITRUM_NOVA = "arbitrum-nova",
  NEAR = "near",
  AVAX = "avax",
  BASE = "base",
  BOBA = "boba",
  BITGERT = "bitgert",
  CELO = "celo",
  CONFLUX = "conflux",
  CRO = "cro",
  CUBE = "cube",
  CMP = "cmp",
  ENULS = "enuls",
  EVMOS = "evmos",
  FANTOM = "fantom",
  FLARE = "flare",
  GNOSIS = "gnosis",
  GODWOKEN = "godwoken",
  HECO = "heco",
  KAVA = "kava",
  KCC = "kcc",
  KLAY = "klay",
  LINEA = "linea",
  METIS = "metis",
  MANTLE = "mantle",
  MOONBEAM = "moonbeam",
  MOONRIVER = "moonriver",
  OKX = "okx",
  OPTIMISM = "optimism",
  OPBNB = "op-bnb",
  PGN = "pgn",
  POLYGON = "polygon",
  POLYGON_ZKEVM = "polygon-zkevm",
  POLYGON_ZKEVM_TEST = "polygon-zkevm-test",
  REI = "rei",
  SYS = "sys",
  ZKSYNC_V1 = "zksync-v1",
  ZKSYNC_ERA = "zksync-era",
  ZKSYNC_V2_TEST = "zksync-v2-test",
  RINKEBY = "rinkeby",
  GOERLI = "goerli",
  KOVAN = "kovan",
  ZENITH = "zenith",
  AVAX_FUJI = "avax-fuji",
  BASE_GOERLI = "base-goerli",
  EOS_EVM = "eos-evm",
  GOSHEN_TEST = "goshen-test",
  FILECOIN = "filecoin",
  FILECOIN_EVM = "filecoin-evm",
  LINEA_TEST = "linea-test",
  MANTA_TEST = "manta-test",
  OPSIDE_TESTNET_PRE_ALPHA = "opside-testnet-pre-alpha",
  SCROLL_ALPHA = "scroll-alpha",
  SEPOLIA = "sepolia",
  SOLANA = "solana",
  SOLANA_DEVNET = "solana-devnet",
  TAIKO_ALPHA_3 = "taiko-alpha-3",
  TAIKO_ELDFELL = "taiko-eldfell",
  SHARDEUM_SPHINX_1 = "shardeum-sphinx-1",
  SHARDEUM_SPHINX_DAPP_1 = "shardeum-sphinx-dapp-1",
  ZETA_ATHENS_2 = "zeta-athens-2",

  BITCOIN = "bitcoin",
  BITCOIN_TESTNET = "bitcoin-testnet",

  SUI = "sui",
  SUI_TESTNET = "sui-testnet",

  APTOS = "aptos",
  APTOS_TESTNET = "aptos-testnet",

  IRONFISH = "ironfish",

  ALEO_TESTNET_3 = "aleo_testnet_3",

  QTUM = "qtum",
  QTUM_TESTNET = "qtum-testnet",
}

export type EthCustomRPCUniqueId = `${InnerChainUniqueId.ETHEREUM}-${number}`;

export type ChainUniqueId = InnerChainUniqueId | EthCustomRPCUniqueId;