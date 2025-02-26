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
import CeloLogo from "core/assets/images/chains/celo.webp";
import PolygonLogo from "core/assets/images/chains/polygon.webp";
import NEARLogo from "core/assets/images/chains/aurora.webp";
import OKXLogo from "core/assets/images/chains/okx.webp";
import OptimismLogo from "core/assets/images/chains/optimism.webp";
import BNBLogo from "core/assets/images/chains/bnb.webp";
import FILEVMLogo from "core/assets/images/chains/filecoin_evm.webp";
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
};

export const ETH_CHAIN_IDS = Object.values(ETH_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);

export const INNER_ETH_CONFIG: ETHConfig[] = Object.values(ETH_CHAIN_CONFIGS);
