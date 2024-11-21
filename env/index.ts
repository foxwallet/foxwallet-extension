import { shuffle } from "@/common/utils/array";

export const ReserveChainConfigs = {
  // ALEO_TESTNET: {
  //   rpcList: shuffle(
  //     JSON.parse(import.meta.env.VITE_ALEO_RPC_LIST) as string[],
  //   ),
  //   syncApiList: shuffle(
  //     JSON.parse(import.meta.env.VITE_ALEO_SYNC_API_LIST) as string[],
  //   ),
  //   walletApiList: shuffle(
  //     JSON.parse(import.meta.env.VITE_ALEO_WALLET_API_LIST) as string[],
  //   ),
  // },
  aleo_mainnet: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ALEO_RPC_LIST) as string[],
    ),
    syncApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ALEO_SYNC_API_LIST) as string[],
    ),
    walletApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ALEO_WALLET_API_LIST) as string[],
    ),
  },
  ethereum: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ETHEREUM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ETHEREUM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ETHEREUM_BLOCKBOOK_LIST) as string[],
    ),
  },
  bnb: {
    rpcList: shuffle(JSON.parse(import.meta.env.VITE_BNB_RPC_LIST) as string[]),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BNB_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BNB_BLOCKBOOK_LIST) as string[],
    ),
  },
  "filecoin-evm": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_FILECOIN_EVM_RPC_LIST) as string[],
    ),
  },
  sepolia: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_SEPOLIA_RPC_LIST) as string[],
    ),
  },
};
