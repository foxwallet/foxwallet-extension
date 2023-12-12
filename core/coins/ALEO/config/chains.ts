import { CoinType } from "core/types";
import { AleoConfig } from "../types/AleoConfig";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
// @ts-expect-error missing type
import AleoLogo from "../../../assets/images/chains/aleo.webp";
import { NATIVE_TOKEN_PROGRAM_ID } from "../constants";
import { ReserveChainConfigs } from "../../../../env";

export const ALEO_CHAIN_CONFIGS: { [key in string]: AleoConfig } = {
  TEST_NET_3: {
    coinType: CoinType.ALEO,
    uniqueId: InnerChainUniqueId.ALEO_TESTNET3,
    logo: AleoLogo,
    chainId: "testnet3",
    chainName: "Aleo Testnet3",
    rpcList: ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET3].rpcList,
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
    testnet: true,
  },
};
