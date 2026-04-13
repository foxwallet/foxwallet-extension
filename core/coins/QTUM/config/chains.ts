import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type QtumConfig } from "core/coins/QTUM/types/QtumConfig";
import { qtumNetwork, qtumTestnetNetwork } from "../constants";
import { ReserveChainConfigs } from "../../../../env";
import QtumLogo from "core/assets/images/chains/qtum.webp";
import QtumTestLogo from "core/assets/images/chains/qtum_test.webp";

const QTUM_CHAIN_CONFIGS: Record<string, QtumConfig> = {
  [InnerChainUniqueId.QTUM]: {
    coinType: CoinType.QTUM,
    uniqueId: InnerChainUniqueId.QTUM,
    chainId: "81",
    chainName: "Qtum",
    nativeCurrency: {
      name: "Qtum",
      symbol: "QTUM",
      decimals: 8,
      logo: QtumLogo,
    },
    logo: QtumLogo,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://qtum.info/",
    },
    explorerPaths: {
      tx: "/tx/{txHash}",
      address: "/address/{address}",
    },
    chainRemark: {
      en: "Qtum Mainnet",
      zh: "Qtum 主网",
    },
    network: qtumNetwork,
    qtumInfoApiList: ["https://qtum.info/api", "https://qtumscan.io/api"],
    blockbookApiList: [
      "https://blockv3.qtum.info/",
      "https://qtumblockexplorer.com/",
    ],
    rpcList: [
      "https://mainnet.qnode.qtum.info/v1/S0ML1u0egLDKsfgzlj8JyAy25p0VJO2D2vJjN",
      "https://qtum-janus.foxnb.net",
      "https://janus.qiswap.com/api/",
    ],
    autoAdd: true,
    testnet: false,
  },
  [InnerChainUniqueId.QTUM_TESTNET]: {
    coinType: CoinType.QTUM,
    uniqueId: InnerChainUniqueId.QTUM_TESTNET,
    chainId: "8889",
    chainName: "Qtum Testnet",
    nativeCurrency: {
      name: "Qtum Testnet",
      symbol: "tQTUM",
      decimals: 8,
      logo: QtumTestLogo,
    },
    logo: QtumTestLogo,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://testnet.qtum.info/",
    },
    explorerPaths: {
      tx: "/tx/{txHash}",
      address: "/address/{address}",
    },
    chainRemark: {
      en: "Qtum Testnet",
      zh: "Qtum 测试网",
    },
    network: qtumTestnetNetwork,
    qtumInfoApiList: ["https://testnet.qtum.info/api"],
    rpcList: [
      "https://testnet.qnode.qtum.info/v1/S0ML1u0egLDKsfgzlj8JyAy25p0VJO2D2vJjN",
    ],
    autoAdd: false,
    testnet: true,
    faucetApi: "https://testnet-faucet.qtum.info/app/",
  },
};

export const INNER_QTUM_CONFIG: QtumConfig[] = Object.values(
  QTUM_CHAIN_CONFIGS,
).map((config) => {
  const uniqueId = config.uniqueId as InnerChainUniqueId;
  const reserveConfig = ReserveChainConfigs[uniqueId];

  return {
    ...config,
    rpcList: reserveConfig?.rpcList ?? config.rpcList,
    qtumInfoApiList: reserveConfig?.qtumInfoApiList ?? config.qtumInfoApiList,
    blockbookApiList:
      reserveConfig?.blockbookApiList ?? config.blockbookApiList,
  };
});
