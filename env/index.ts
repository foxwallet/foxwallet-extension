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
  arbitrum: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ARBITRUM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ARBITRUM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ARBITRUM_BLOCKBOOK_LIST) as string[],
    ),
  },
  "arbitrum-nova": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ARBITRUM_NOVA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(
        import.meta.env.VITE_ARBITRUM_NOVA_BLOCKSCOUT_LIST,
      ) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ARBITRUM_NOVA_BLOCKBOOK_LIST) as string[],
    ),
  },
  areon: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_AREON_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_AREON_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_AREON_BLOCKBOOK_LIST) as string[],
    ),
  },
  avax: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_AVAX_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_AVAX_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_AVAX_BLOCKBOOK_LIST) as string[],
    ),
  },
  bahamut: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BAHAMUT_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BAHAMUT_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BAHAMUT_BLOCKBOOK_LIST) as string[],
    ),
  },
  base: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BASE_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BASE_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BASE_BLOCKBOOK_LIST) as string[],
    ),
  },
  bitgert: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BITGERT_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BITGERT_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BITGERT_BLOCKBOOK_LIST) as string[],
    ),
  },
  bitlayer: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BITLAYER_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BITLAYER_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BITLAYER_BLOCKBOOK_LIST) as string[],
    ),
  },
  boba: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BOBA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BOBA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BOBA_BLOCKBOOK_LIST) as string[],
    ),
  },
  blast: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BLAST_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BLAST_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BLAST_BLOCKBOOK_LIST) as string[],
    ),
  },
  celo: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_CELO_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CELO_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CELO_BLOCKBOOK_LIST) as string[],
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
  polygon: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_POLYGON_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_POLYGON_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_POLYGON_BLOCKBOOK_LIST) as string[],
    ),
  },
  "polygon-zkevm": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_POLYGON_ZKEVM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(
        import.meta.env.VITE_POLYGON_ZKEVM_BLOCKSCOUT_LIST,
      ) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_POLYGON_ZKEVM_BLOCKBOOK_LIST) as string[],
    ),
  },
  near: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_NEAR_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_NEAR_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_NEAR_BLOCKBOOK_LIST) as string[],
    ),
  },
  okx: {
    rpcList: shuffle(JSON.parse(import.meta.env.VITE_OKX_RPC_LIST) as string[]),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_OKX_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_OKX_BLOCKBOOK_LIST) as string[],
    ),
  },
  optimism: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_OPTIMISM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_OPTIMISM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_OPTIMISM_BLOCKBOOK_LIST) as string[],
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
