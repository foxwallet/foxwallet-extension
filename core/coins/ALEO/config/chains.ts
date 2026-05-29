import { CoinType } from "core/types";
import { type AleoConfig } from "../types/AleoConfig";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import AleoLogo from "../../../assets/images/chains/aleo.webp";
import StAleoLogo from "../../../assets/images/tokens/staleo.webp";

import {
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
  USAD_STABLECOIN_PROGRAM_ID,
  USDCX_STABLECOIN_PROGRAM_ID,
} from "../constants";
import { ReserveChainConfigs } from "../../../../env";
import { type Token } from "../types/Token";

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

export const USAD_TOKEN: Token = {
  name: "USAD",
  decimals: 6,
  symbol: "USAD",
  programId: USAD_STABLECOIN_PROGRAM_ID,
  logo: "",
  tokenId: "__USAD_TOKEN__",
  official: true,
};

export const USDCX_TOKEN: Token = {
  name: "USDCx",
  decimals: 6,
  symbol: "USDCx",
  programId: USDCX_STABLECOIN_PROGRAM_ID,
  logo: "",
  tokenId: "__USDCX_TOKEN__",
  official: true,
};

export const ALEO_CHAIN_CONFIGS: { [key in string]: AleoConfig } = {
  // TESTNET: {
  //   coinType: CoinType.ALEO,
  //   uniqueId: InnerChainUniqueId.ALEO_TESTNET,
  //   logo: AleoLogo,
  //   chainId: "testnet",
  //   chainName: "Aleo",
  //   rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET].rpcList,
  //   walletApiList:
  //     ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET].walletApiList,
  //   nativeCurrency: ALEO_NATIVE_CURRENCY,
  //   explorerUrls: {
  //     [ExplorerLanguages.EN]: "https://aleo.info/en/",
  //     [ExplorerLanguages.ZH]: "https://aleo.info/en/",
  //   },
  //   explorerPaths: {
  //     tx: "/transaction/{txid}",
  //     address: "",
  //   },
  //   alphaSwapApi: "https://app.alphaswap.pro/api",
  //   innerFaucet: true,
  //   faucetApi: "https://faucet.aleo.org/",
  //   testnet: true,
  // },
  MAINNET: {
    coinType: CoinType.ALEO,
    uniqueId: InnerChainUniqueId.ALEO_MAINNET,
    autoAdd: true,
    logo: AleoLogo,
    chainId: "mainnet",
    chainName: "Aleo Mainnet",
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].rpcList,
    walletApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].walletApiList,
    nativeCurrency: ALEO_NATIVE_CURRENCY,
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://explorer.provable.com/",
    },
    explorerPaths: {
      tx: "/transaction/{txid}",
      address: "/address/{addr}",
    },
    alphaSwapApi: "https://mainnet.alphaswap.pro/api",
    aleoInfoApi: "https://api.aleo.info",
    arcaneApi:
      "https://arcane-finance-backend-mainnet-2wxtu.ondigitalocean.app",
  },
};

export const ALEO_CHAIN_IDS = Object.values(ALEO_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);

export const INNER_ALEO_CONFIG: AleoConfig[] =
  Object.values(ALEO_CHAIN_CONFIGS);
