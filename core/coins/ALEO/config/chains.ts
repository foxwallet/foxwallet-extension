import { CoinType } from "core/types";
import { AleoConfig } from "../types/AleoConfig";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import AleoLogo from "../../../assets/images/chains/aleo.webp";
import { NATIVE_TOKEN_PROGRAM_ID } from "../constants";
import { ReserveChainConfigs, WalletAPI } from "../../../../env";

export const ALEO_CHAIN_CONFIGS: { [key in string]: AleoConfig } = {
  TESTNET3: {
    coinType: CoinType.ALEO,
    uniqueId: InnerChainUniqueId.ALEO_TESTNET3,
    // @ts-expect-error missing type
    logo: AleoLogo,
    chainId: "testnet3",
    chainName: "Aleo Testnet3",
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET3].rpcList,
    syncApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET3].syncApiList,
    walletApiList:
      ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET3].walletApiList,
    nativeCurrency: {
      name: "Aleo",
      decimals: 6,
      symbol: "ALEO",
      address: NATIVE_TOKEN_PROGRAM_ID,
    },
    explorerUrls: {
      [ExplorerLanguages.EN]: "https://aleo.info/en/",
      [ExplorerLanguages.ZH]: "https://aleo.info/en/",
    },
    explorerPaths: {
      tx: "/transaction/{txid}",
      address: "",
    },
    faucetApi: `${WalletAPI}/api/v1/aleo/testnet3/faucet`,
    innerFaucet: true,
    testnet: true,
  },
};

export const ALEO_CHAIN_IDS = Object.values(ALEO_CHAIN_CONFIGS).map(
  (c) => c.chainId,
);
