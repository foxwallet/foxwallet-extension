import { CoinType } from "core/types";
import { AleoConfig } from "../types/AleoConfig";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import AleoLogo from "../../../assets/images/chains/aleo.webp";
import StAleoLogo from "../../../assets/images/tokens/staleo.webp";

import {
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "../constants";
import { ReserveChainConfigs } from "../../../../env";
import { Token } from "../types/Token";

export const ALEO_NATIVE_CURRENCY = {
  name: "Aleo",
  decimals: 6,
  symbol: "ALEO",
  address: NATIVE_TOKEN_PROGRAM_ID,
  logo: AleoLogo,
};

export const ALEO_NATIVE_TOKEN: Token = {
  ...ALEO_NATIVE_CURRENCY,
  tokenId: NATIVE_TOKEN_TOKEN_ID,
  official: true,
  programId: NATIVE_TOKEN_PROGRAM_ID,
};

export const BETA_STAKING_ALEO_TOKEN: Token = {
  name: "stAleo",
  decimals: 6,
  symbol: "stALEO",
  programId: BETA_STAKING_PROGRAM_ID,
  logo: StAleoLogo,
  tokenId: BETA_STAKING_ALEO_TOKEN_ID,
  official: true,
};

export const ALEO_CHAIN_CONFIGS: { [key in string]: AleoConfig } = {
  TESTNET: {
    coinType: CoinType.ALEO,
    uniqueId: InnerChainUniqueId.ALEO_TESTNET,
    logo: AleoLogo,
    chainId: "testnet",
    chainName: "Aleo",
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET].rpcList,
    syncApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET].syncApiList,
    walletApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET].walletApiList,
    nativeCurrency: ALEO_NATIVE_CURRENCY,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://aleo.info/en/",
      [ExplorerLanguages.ZH]: "https://aleo.info/en/",
    },
    explorerPaths: {
      tx: "/transaction/{txid}",
      address: "",
    },
    alphaSwapApi: "https://app.alphaswap.pro/api",
    innerFaucet: true,
    faucetApi: "https://faucet.aleo.org/",
    testnet: true,
  },
  MAINNET: {
    coinType: CoinType.ALEO,
    uniqueId: InnerChainUniqueId.ALEO_MAINNET,
    logo: AleoLogo,
    chainId: "mainnet",
    chainName: "Aleo",
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].rpcList,
    syncApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].syncApiList,
    walletApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].walletApiList,
    nativeCurrency: ALEO_NATIVE_CURRENCY,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://aleo.info/en/",
      [ExplorerLanguages.ZH]: "https://aleo.info/en/",
    },
    explorerPaths: {
      tx: "/transaction/{txid}",
      address: "",
    },
    alphaSwapApi: "https://mainnet.alphaswap.pro/api",
    arcaneApi:
      "https://arcane-finance-backend-mainnet-2wxtu.ondigitalocean.app",
  },
};

export const ALEO_CHAIN_IDS = Object.values(ALEO_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);
