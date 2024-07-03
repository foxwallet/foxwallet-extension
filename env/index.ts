import { shuffle } from "@/common/utils/array";

export const ReserveChainConfigs = {
  ALEO_TESTNET: {
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
};

export const WalletAPI = import.meta.env.VITE_WALLET_API;
