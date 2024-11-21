import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { SupportLanguages } from "@/locales/i18";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { FUNC_SIG } from "core/coins/ETH/constants";
import { ReserveChainConfigs } from "../../../../env";
import EthereumLogo from "core/assets/images/chains/ethereum.webp";
import BNBLogo from "core/assets/images/chains/bnb.webp";
import FILEVMLogo from "core/assets/images/chains/filecoin_evm.webp";
import EVMPlaceHolder from "core/assets/images/chains/placeholder.webp";

export const ETH_NATIVE_CURRENCY = {
  name: "ETH",
  decimals: 18,
  symbol: "ETH",
  logo: EthereumLogo,
};

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
    nativeCurrency: ETH_NATIVE_CURRENCY,
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
};

export const ETH_CHAIN_IDS = Object.values(ETH_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);

export const INNER_ETH_CONFIG: ETHConfig[] = Object.values(ETH_CHAIN_CONFIGS);
