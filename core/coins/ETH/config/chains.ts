import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { SupportLanguages } from "@/locales/i18";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { FUNC_SIG } from "core/coins/ETH/constants";
import { ReserveChainConfigs } from "../../../../env";
import EthereumLogo from "core/assets/images/chains/ethereum.webp";
import EthTokenLogo from "core/assets/images/tokens/eth_token.webp";
import ArbitrumLogo from "core/assets/images/chains/arbitrum.webp";
import ArbitrumNovaLogo from "core/assets/images/chains/nova.webp";
import AreonLogo from "core/assets/images/chains/areon.webp";
import AvaxLogo from "core/assets/images/chains/avax.webp";
import BahamutLogo from "core/assets/images/chains/bahamut.webp";
import BaseLogo from "core/assets/images/chains/base.webp";
import BitgertLogo from "core/assets/images/chains/bitgert.webp";
import BitlayerLogo from "core/assets/images/chains/bitlayer.webp";
import BtcLogo from "core/assets/images/chains/btc.webp";
import BobaLogo from "core/assets/images/chains/boba.webp";
import BlastLogo from "core/assets/images/chains/blast.webp";
import BsquaredLogo from "core/assets/images/chains/bsquared.webp";
import CagaLogo from "core/assets/images/chains/caga.webp";
import CeloLogo from "core/assets/images/chains/celo.webp";
import CoreLogo from "core/assets/images/chains/core.webp";
import CronosLogo from "core/assets/images/chains/cronos.webp";
import EOSLogo from "core/assets/images/chains/eos.webp";
import FantomLogo from "core/assets/images/chains/fantom.webp";
import GnosisLogo from "core/assets/images/chains/gnosis.webp";
import InevmLogo from "core/assets/images/chains/inevm.webp";
import JocLogo from "core/assets/images/chains/joc.webp";
import KavaLogo from "core/assets/images/chains/kava.webp";
import LineaLogo from "core/assets/images/chains/linea.webp";
import LumiaLogo from "core/assets/images/chains/lumia.webp";
import MantleLogo from "core/assets/images/chains/mantle.webp";
import MorphLogo from "core/assets/images/chains/morph.webp";
import PolygonLogo from "core/assets/images/chains/polygon.webp";
import NEARLogo from "core/assets/images/chains/aurora.webp";
import OKXLogo from "core/assets/images/chains/okx.webp";
import OptimismLogo from "core/assets/images/chains/optimism.webp";
import BNBLogo from "core/assets/images/chains/bnb.webp";
import FILEVMLogo from "core/assets/images/chains/filecoin_evm.webp";
import ScrollLogo from "core/assets/images/chains/scroll.webp";
import TaikoLogo from "core/assets/images/chains/taiko.webp";
import ZchainsLogo from "core/assets/images/chains/zchains.webp";
import ZksyncLogo from "core/assets/images/chains/zksync.webp";
import EVMPlaceHolder from "core/assets/images/chains/placeholder.webp";

export const ETH_CHAIN_CONFIGS: { [key in string]: ETHConfig } = {
  MAIN_NET: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.ETHEREUM,
    autoAdd: true,
    logo: EthereumLogo,
    chainId: "1",
    chainName: "Ethereum",
    chainRemark: {
      [SupportLanguages.EN]: "ETH, ERC20",
      [SupportLanguages.ZH]: "以太坊, ERC20",
      [SupportLanguages.JA]: "イーサリアム, ERC20",
    },
    nativeCurrency: {
      name: "ETH",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ETHEREUM].rpcList,
    moralisEnabled: true,
    nft: {
      supportResync: true,
      supportCollectionWay: true,
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/ethereum/{addr}",
          itemPath: "/assets/ethereum/{addr}/{id}",
        },
        {
          name: "LooksRare",
          baseUrl: "https://looksrare.org",
          collectionPath: "/collections/{addr}",
          itemPath: "/collections/{addr}/{id}",
        },
        {
          name: "X2Y2",
          baseUrl: "https://x2y2.io",
          collectionPath: "",
          itemPath: "/eth/{addr}/{id}",
        },
        {
          name: "Blur",
          baseUrl: "https://blur.io",
          collectionPath: "/collection/{addr}",
          itemPath: "/asset/{addr}/{id}",
        },
      ],
    },
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.ETHEREUM].blockscoutApiList,
    blockbookApiList:
      ReserveChainConfigs[InnerChainUniqueId.ETHEREUM].blockbookApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://etherscan.io",
      [ExplorerLanguages.ZH]: "https://etherscan.io",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    minGasLimits: [
      {
        contract: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 130000,
      },
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "ApprovalManageScreen",
    safeConfirmations: 12,
  },
  ARBITRUM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.ARBITRUM,
    autoAdd: true,
    logo: ArbitrumLogo,
    chainId: "42161",
    chainName: "Arbitrum",
    chainRemark: {
      [SupportLanguages.EN]: "ARB",
    },
    nativeCurrency: {
      name: "Ether",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ARBITRUM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.ARBITRUM].blockscoutApiList,
    moralisEnabled: true,
    nft: {
      supportCollectionWay: true,
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/arbitrum/{addr}",
          itemPath: "/assets/arbitrum/{addr}/{id}",
        },
        {
          name: "Trove",
          baseUrl: "https://trove.treasure.lol",
          collectionPath: "/collection/{addr}",
          itemPath: "/collection/{addr}/{id}",
        },
        {
          name: "tofuNFT",
          baseUrl: "https://tofunft.com",
          collectionPath: "",
          itemPath: "/nft/arbi/{addr}/{id}",
        },
      ],
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://arbiscan.io",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    minGasLimits: [
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  ARBITRUM_NOVA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.ARBITRUM_NOVA,
    logo: ArbitrumNovaLogo,
    chainId: "42170",
    chainName: "Arbitrum Nova",
    nativeCurrency: {
      name: "Ether",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ARBITRUM_NOVA].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.ARBITRUM_NOVA].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://nova-explorer.arbitrum.io",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  AREON: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.AREON,
    logo: AreonLogo,
    chainId: "463",
    chainName: "Areon",
    chainRemark: {
      [SupportLanguages.EN]: "AREA",
    },
    nativeCurrency: {
      name: "AREA",
      decimals: 18,
      symbol: "AREA",
      coingeckoCoinId: "areon-network",
      logo: AreonLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.AREON].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://areonscan.com/",
    },
    explorerPaths: {
      tx: "/transactions/{txid}",
      address: "/accounts/{addr}",
    },
  },
  AVAX: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.AVAX,
    autoAdd: true,
    logo: AvaxLogo,
    chainId: "43114",
    chainName: "Avalanche C",
    chainRemark: {
      [SupportLanguages.EN]: "AVAX",
      [SupportLanguages.ZH]: "雪崩, AVAX",
    },
    coingeckoPlatformId: "avalanche",
    nativeCurrency: {
      name: "Avalanche",
      decimals: 18,
      symbol: "AVAX",
      coingeckoCoinId: "avalanche",
      logo: AvaxLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.AVAX].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.AVAX].blockscoutApiList,
    nft: {
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/avalanche/{addr}",
          itemPath: "/assets/avalanche/{addr}/{id}",
        },
        {
          name: "tofuNFT",
          baseUrl: "https://tofunft.com",
          collectionPath: "",
          itemPath: "/nft/avax/{addr}/{id}",
        },
      ],
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://snowtrace.dev",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token:
        "/address/{addr}/tokentxns?tokenAddresses={token}&chainId=43114#erc20",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  BAHAMUT: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BAHAMUT,
    logo: BahamutLogo,
    chainId: "5165",
    chainName: "Bahamut",
    chainRemark: {
      [SupportLanguages.EN]: "FTN",
    },
    nativeCurrency: {
      name: "FTN",
      symbol: "FTN",
      decimals: 18,
      coingeckoCoinId: "fasttoken",
      logo: BahamutLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BAHAMUT].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BAHAMUT].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://www.ftnscan.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
  },
  BASE: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BASE,
    autoAdd: true,
    logo: BaseLogo,
    chainId: "8453",
    chainName: "Base",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BASE].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BASE].blockscoutApiList,
    moralisEnabled: true,
    nft: {
      supportCollectionWay: true,
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://basescan.org",
      [ExplorerLanguages.ZH]: "https://basescan.org",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  BITGERT: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BITGERT,
    logo: BitgertLogo,
    chainId: "32520",
    chainName: "Bitgert",
    chainRemark: {
      [SupportLanguages.EN]: "BRISE",
    },
    nativeCurrency: {
      name: "Brise",
      decimals: 18,
      symbol: "BRISE",
      coingeckoCoinId: "bitrise-token",
      logo: BitgertLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BITGERT].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BITGERT].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://brisescan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  BITLAYER: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BITLAYER,
    logo: BitlayerLogo,
    chainId: "200901",
    chainName: "Bitlayer",
    chainRemark: {
      [SupportLanguages.EN]: "BTR",
    },
    nativeCurrency: {
      name: "BTC",
      symbol: "BTC",
      decimals: 18,
      logo: BtcLogo,
      coingeckoCoinId: "bitcoin",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BITLAYER].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://www.btrscan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
    },
  },
  BOBA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BOBA,
    logo: BobaLogo,
    chainId: "288",
    chainName: "Boba",
    nativeCurrency: {
      name: "Ether",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BOBA].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://bobascan.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokentxns?tokenAddresses={token}#erc20",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  BLAST: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BLAST,
    autoAdd: true,
    logo: BlastLogo,
    chainId: "81457",
    chainName: "Blast",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BLAST].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BLAST].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://blastscan.io/",
      [ExplorerLanguages.ZH]: "https://blastscan.io/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokentxns?tokenAddresses={token}#erc20",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
    communities: [
      {
        name: "X(Twitter)",
        url: "https://twitter.com/Blast_L2",
      },
      {
        name: "Discord",
        url: "https://discord.gg/blast-l2",
      },
    ],
  },
  BSQUARED: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BSQUARED,
    autoAdd: true,
    logo: BsquaredLogo,
    chainId: "223",
    chainName: "B²",
    chainRemark: {
      [SupportLanguages.EN]: "BSquared",
    },
    nativeCurrency: {
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 18,
      logo: BtcLogo,
      coingeckoCoinId: "bitcoin",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BSQUARED].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BSQUARED].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.bsquared.network/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
    },
  },
  BNB: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.BNB,
    autoAdd: true,
    logo: BNBLogo,
    chainId: "56",
    chainName: "BNB Chain",
    chainRemark: {
      [SupportLanguages.EN]: "BSC, BEP20",
      [SupportLanguages.ZH]: "币安智能链, BEP20",
    },
    nativeCurrency: {
      name: "Binance Chain Native Token",
      decimals: 18,
      symbol: "BNB",
      coingeckoCoinId: "binancecoin",
      logo: BNBLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.BNB].rpcList,
    moralisEnabled: true,
    nft: {
      supportResync: true,
      supportCollectionWay: true,
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/bsc/{addr}",
          itemPath: "/assets/bsc/{addr}/{id}",
        },
        {
          name: "Element",
          baseUrl: "https://element.market",
          collectionPath: "/assets/bsc/{addr}",
          itemPath: "/assets/bsc/{addr}/{id}",
        },
      ],
    },
    blockbookApiList:
      ReserveChainConfigs[InnerChainUniqueId.BNB].blockbookApiList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.BNB].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://bscscan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    minGasLimits: [
      {
        contract: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 59100,
      },
      {
        contract: "0x55d398326f99059ff775485246999027b3197955", // USDT
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 53000,
      },
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "ApprovalManageScreen",
  },
  CAGA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.CAGA,
    autoAdd: true,
    logo: CagaLogo,
    chainId: "72888",
    chainName: "CAGA",
    nativeCurrency: {
      name: "CAGA",
      symbol: "CAGA",
      decimals: 18,
      logo: CagaLogo,
      coingeckoCoinId: "crypto-asset-governance-alliance",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.CAGA].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.cagamainnet.com/",
    },
    explorerPaths: {
      tx: "/transaction/{txid}",
      address: "/address/{addr}",
    },
    communities: [
      {
        name: "X(Twitter)",
        url: "https://www.twitter.com/_cagacrypto",
      },
      {
        name: "Discord",
        url: "https://discord.gg/hsNNAXuENr",
      },
      {
        name: "Telegram",
        url: "https://t.me/cagacryptogroup",
      },
    ],
  },
  CELO: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.CELO,
    autoAdd: true,
    logo: CeloLogo,
    chainId: "42220",
    chainName: "Celo",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
      address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      logo: CeloLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.CELO].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.CELO].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.celo.org/mainnet/",
    },
    explorerPaths: {
      tx: "tx/{txid}",
      address: "address/{addr}",
      token: "address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
    lifi: {
      nativeAddress: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      chainId: "42220",
    },
  },
  CORE: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.CORE,
    autoAdd: true,
    logo: CoreLogo,
    chainId: "1116",
    chainName: "Core",
    nativeCurrency: {
      name: "CORE",
      decimals: 18,
      symbol: "CORE",
      coingeckoCoinId: "coredaoorg",
      logo: CoreLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.CORE].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.CORE].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://scan.coredao.org",
      [ExplorerLanguages.ZH]: "https://scan.coredao.org",
    },
    explorerPaths: {
      tx: "tx/{txid}",
      address: "address/{addr}",
      token: "address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  CRO: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.CRO,
    autoAdd: true,
    logo: CronosLogo,
    chainId: "25",
    chainName: "Cronos",
    nativeCurrency: {
      name: "Cronos",
      symbol: "CRO",
      decimals: 18,
      coingeckoCoinId: "crypto-com-chain",
      logo: CronosLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.CRO].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.CRO].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://cronoscan.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  EOS_EVM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.EOS_EVM,
    autoAdd: true,
    logo: EOSLogo,
    chainId: "17777",
    chainName: "EOS EVM",
    nativeCurrency: {
      name: "EOS",
      symbol: "EOS",
      decimals: 18,
      coingeckoCoinId: "eos",
      logo: EOSLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.EOS_EVM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.EOS_EVM].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.evm.eosnetwork.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  FANTOM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.FANTOM,
    autoAdd: true,
    logo: FantomLogo,
    chainId: "250",
    chainName: "Fantom",
    chainRemark: {
      [SupportLanguages.EN]: "FTM",
    },
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
      logo: FantomLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.FANTOM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.FANTOM].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://ftmscan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    nft: {
      markets: [
        {
          name: "Artion",
          baseUrl: "https://artion.io",
          collectionPath: "/explore?collections={addr}",
          itemPath: "/explore/{addr}/{id}",
        },
      ],
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  FILECOIN_EVM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.FILECOIN_EVM,
    autoAdd: true,
    logo: FILEVMLogo,
    chainId: "314",
    chainName: "Filecoin EVM",
    chainRemark: {
      [SupportLanguages.EN]: "FEVM, FIL",
    },
    coingeckoPlatformId: "filecoin",
    nativeCurrency: {
      name: "Filecoin",
      decimals: 18,
      symbol: "FIL",
      coingeckoCoinId: "filecoin",
      logo: FILEVMLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.FILECOIN_EVM].rpcList,
    filfoxApi: "https://filfox.info/api/v1",
    foxNFTApiEnabled: true,
    nft: {
      supportResync: false,
      supportCollectionWay: false,
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://filfox.info/en/",
      [ExplorerLanguages.ZH]: "https://filfox.info/zh/",
    },
    explorerPaths: {
      tx: "message/{txid}",
      address: "address/{addr}",
    },
    minGasLimits: [
      {
        gasLimit: 2280000,
      },
    ],
    communities: [
      {
        name: "X(Twitter)",
        url: "https://twitter.com/Filecoin",
      },
      {
        name: "Telegram",
        url: "https://t.me/filecoin",
      },
      {
        name: "Slack",
        url: "https://filecoin.io/slack",
      },
    ],
  },
  GNOSIS: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.GNOSIS,
    autoAdd: true,
    logo: GnosisLogo,
    chainId: "100",
    chainName: "Gnosis",
    chainRemark: {
      [SupportLanguages.EN]: "xDAI",
    },
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
      coingeckoCoinId: "xdai",
      logo: GnosisLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.GNOSIS].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.GNOSIS].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://blockscout.com/xdai/mainnet/",
    },
    explorerPaths: {
      tx: "tx/{txid}",
      address: "address/{addr}",
      token: "address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  INEVM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.INEVM,
    autoAdd: true,
    logo: InevmLogo,
    chainId: "2525",
    chainName: "inEVM",
    nativeCurrency: {
      name: "INJ",
      symbol: "INJ",
      decimals: 18,
      coingeckoCoinId: "injective",
      logo: InevmLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.INEVM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.INEVM].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.inevm.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  JOC: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.JOC,
    autoAdd: true,
    logo: JocLogo,
    chainId: "81",
    chainName: "Japan Open Chain",
    chainRemark: {
      [SupportLanguages.EN]: "JOC",
    },
    nativeCurrency: {
      name: "Japan Open Chain Token",
      symbol: "JOC",
      decimals: 18,
      logo: JocLogo,
      coingeckoCoinId: "japan-open-chain",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.JOC].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.JOC].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.japanopenchain.org/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    communities: [
      {
        name: "X(Twitter)",
        url: "https://twitter.com/JapanOpenChain",
      },
      {
        name: "Discord",
        url: "https://discord.gg/5ugv7Zufde",
      },
    ],
  },
  KAVA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.KAVA,
    autoAdd: true,
    logo: KavaLogo,
    chainId: "2222",
    chainName: "Kava EVM",
    nativeCurrency: {
      name: "KAVA",
      symbol: "KAVA",
      decimals: 18,
      logo: KavaLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.KAVA].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.KAVA].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://kavascan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  LINEA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.LINEA,
    autoAdd: true,
    logo: LineaLogo,
    chainId: "59144",
    chainName: "Linea",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.LINEA].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.LINEA].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://lineascan.build/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  LUMIA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.LUMIA,
    autoAdd: true,
    logo: LumiaLogo,
    chainId: "994873017",
    chainName: "Lumia",
    nativeCurrency: {
      name: "LUMIA",
      symbol: "LUMIA",
      decimals: 18,
      logo: LumiaLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.LUMIA].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.LUMIA].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.lumia.org/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
  },
  MANTLE: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.MANTLE,
    autoAdd: true,
    logo: MantleLogo,
    chainId: "5000",
    chainName: "Mantle",
    chainRemark: {
      [SupportLanguages.EN]: "MNT",
    },
    nativeCurrency: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18,
      address: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
      logo: MantleLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.MANTLE].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.MANTLE].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.mantle.xyz",
      [ExplorerLanguages.ZH]: "https://explorer.mantle.xyz",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  MORPH: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.MORPH,
    autoAdd: true,
    logo: MorphLogo,
    chainId: "2818",
    chainName: "Morph",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.MORPH].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.MORPH].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.morphl2.io",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    communities: [
      {
        name: "X(Twitter)",
        url: "https://x.com/Morphl2",
      },
      {
        name: "Telegram",
        url: "https://t.me/MorphL2official",
      },
      {
        name: "Discord",
        url: "https://discord.com/invite/L2Morph",
      },
    ],
  },
  NEAR: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.NEAR,
    logo: NEARLogo,
    chainId: "1313161554",
    chainName: "Aurora",
    coingeckoPlatformId: "aurora",
    nativeCurrency: {
      name: "Ether",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.NEAR].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.NEAR].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.mainnet.aurora.dev",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/address/{addr}/tokens/{token}/token-transfers#address-tabs",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  OKX: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.OKX,
    logo: OKXLogo,
    chainId: "66",
    chainName: "OKTC",
    chainRemark: {
      [SupportLanguages.ZH]: "OK链",
    },
    nativeCurrency: {
      name: "OKXChain Token",
      symbol: "OKT",
      decimals: 18,
      coingeckoCoinId: "okt-chain",
      logo: OKXLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.OKX].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://www.oklink.com/oktc/",
      [ExplorerLanguages.ZH]: "https://www.oklink.com/cn/oktc/",
    },
    explorerPaths: {
      tx: "tx/{txid}",
      address: "address/{addr}",
    },
  },
  OPTIMISM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.OPTIMISM,
    autoAdd: true,
    logo: OptimismLogo,
    chainId: "10",
    chainName: "Optimism",
    chainRemark: {
      [SupportLanguages.EN]: "OP",
    },
    coingeckoPlatformId: "optimistic-ethereum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.OPTIMISM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.OPTIMISM].blockscoutApiList,
    moralisEnabled: true,
    nft: {
      supportCollectionWay: true,
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/optimism/{addr}",
          itemPath: "/assets/optimism/{addr}/{id}",
        },
      ],
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://optimistic.etherscan.io",
      [ExplorerLanguages.ZH]: "https://optimistic.etherscan.io",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    minGasLimits: [
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  SEPOLIA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.SEPOLIA,
    testnet: true,
    logo: EVMPlaceHolder,
    chainId: "11155111",
    chainName: "Sepolia Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EVMPlaceHolder,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.SEPOLIA].rpcList,
    blockscoutApiList: ["https://eth-sepolia.blockscout.com/api/v2"],
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://sepolia.etherscan.io/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    faucetWebList: [
      "https://faucet.quicknode.com/ethereum/sepolia",
      "https://www.infura.io/faucet",
      "https://faucet-sepolia.rockx.com/",
      "https://sepoliafaucet.com/",
      "https://sepolia-faucet.pk910.de",
    ],
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  POLYGON: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.POLYGON,
    autoAdd: true,
    logo: PolygonLogo,
    chainId: "137",
    chainName: "Polygon",
    chainRemark: {
      [SupportLanguages.EN]: "POL, MATIC",
      [SupportLanguages.ZH]: "POL, MATIC, 马蹄链",
    },
    coingeckoPlatformId: "polygon-pos",
    nativeCurrency: {
      name: "Polygon Ecosystem Token",
      symbol: "POL",
      decimals: 18,
      address: "0x0000000000000000000000000000000000001010",
      coingeckoCoinId: "matic-network",
      logo: PolygonLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.POLYGON].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.POLYGON].blockscoutApiList,
    moralisEnabled: true,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://polygonscan.com",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    nft: {
      supportCollectionWay: true,
      markets: [
        {
          name: "OpenSea",
          baseUrl: "https://opensea.io",
          collectionPath: "/assets/matic/{addr}",
          itemPath: "/assets/matic/{addr}/{id}",
        },
        {
          name: "tofuNFT",
          baseUrl: "https://tofunft.com",
          collectionPath: "",
          itemPath: "/nft/polygon/{addr}/{id}",
        },
        {
          name: "Element",
          baseUrl: "https://element.market",
          collectionPath: "/assets/polygon/{addr}",
          itemPath: "/assets/polygon/{addr}/{id}",
        },
      ],
    },
    minMaxPriorityFeePerGas: "30000000000",
    minGasLimits: [
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  POLYGON_ZKEVM: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.POLYGON_ZKEVM,
    logo: PolygonLogo,
    chainId: "1101",
    chainName: "Polygon zkEVM",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.POLYGON_ZKEVM].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.POLYGON_ZKEVM].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://zkevm.polygonscan.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  SCROLL: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.SCROLL,
    autoAdd: true,
    logo: ScrollLogo,
    chainId: "534352",
    chainName: "Scroll",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.SCROLL].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.SCROLL].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://scrollscan.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
  TAIKO: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.TAIKO,
    autoAdd: true,
    logo: TaikoLogo,
    chainId: "167000",
    chainName: "Taiko",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: EthTokenLogo,
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.TAIKO].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.TAIKO].blockscoutApiList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://taikoscan.io/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
      token: "/token/{token}?a={addr}",
    },
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
    communities: [
      {
        name: "X(Twitter)",
        url: "https://twitter.com/taikoxyz",
      },
      {
        name: "Discord",
        url: "https://discord.gg/taikoxyz",
      },
      {
        name: "Youtube",
        url: "https://www.youtube.com/@taikoxyz",
      },
    ],
  },
  ZCHAINS: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.ZCHAINS,
    autoAdd: true,
    logo: ZchainsLogo,
    chainId: "168168",
    chainName: "ZChains",
    chainRemark: {
      [SupportLanguages.EN]: "ZCD",
    },
    coingeckoPlatformId: "zchains",
    nativeCurrency: {
      name: "ZCD",
      symbol: "ZCD",
      decimals: 18,
      logo: ZchainsLogo,
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ZCHAINS].rpcList,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://scan.zchains.com/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
    },
    communities: [
      {
        name: "X(Twitter)",
        url: "https://x.com/zchains_io",
      },
      {
        name: "Discord",
        url: "https://discord.com/invite/HgTVFcqPcg",
      },
      {
        name: "Telegram",
        url: "https://t.me/zchains_io",
      },
    ],
  },
  ZKSYNC_ERA: {
    coinType: CoinType.ETH,
    uniqueId: InnerChainUniqueId.ZKSYNC_ERA,
    autoAdd: true,
    logo: ZksyncLogo,
    chainId: "324",
    chainName: "zkSync Era",
    coingeckoPlatformId: "zksync",
    nativeCurrency: {
      name: "zkSync Ether",
      decimals: 18,
      symbol: "ETH",
      logo: EthTokenLogo,
      address: "0x000000000000000000000000000000000000800A",
      coingeckoCoinId: "ethereum",
    },
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ZKSYNC_ERA].rpcList,
    blockscoutApiList:
      ReserveChainConfigs[InnerChainUniqueId.ZKSYNC_ERA].blockscoutApiList,
    apescanEnabled: true,
    nft: {
      supportCollectionWay: false,
      markets: [
        {
          name: "Apescan",
          baseUrl: "https://apescan.co/",
          itemPath: "/#/NftOverview?id={id}&address={addr}",
          collectionPath: "/#/nfts?address={addr}",
        },
        {
          name: "Element",
          baseUrl: "https://element.market",
          itemPath: "/assets/zksync/{addr}/{id}",
          collectionPath: "/assets/zksync/{addr}",
        },
      ],
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.zksync.io/",
    },
    explorerPaths: {
      tx: "/tx/{txid}",
      address: "/address/{addr}",
    },
    minGasLimits: [
      {
        functionHash: FUNC_SIG.TOKEN_TRANSFER,
        gasLimit: 52000,
      },
    ],
    checkApproval: "https://revoke.cash/address/{addr}?chainId={chainId}",
  },
};

export const ETH_CHAIN_IDS = Object.values(ETH_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);

export const INNER_ETH_CONFIG: ETHConfig[] = Object.values(ETH_CHAIN_CONFIGS);
