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
  bsquared: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_BSQUARED_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BSQUARED_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_BSQUARED_BLOCKBOOK_LIST) as string[],
    ),
  },
  caga: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_CAGA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CAGA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CAGA_BLOCKBOOK_LIST) as string[],
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
  core: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_CORE_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CORE_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CORE_BLOCKBOOK_LIST) as string[],
    ),
  },
  cro: {
    rpcList: shuffle(JSON.parse(import.meta.env.VITE_CRO_RPC_LIST) as string[]),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CRO_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_CRO_BLOCKBOOK_LIST) as string[],
    ),
  },
  "eos-evm": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_EOS_EVM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_EOS_EVM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_EOS_EVM_BLOCKBOOK_LIST) as string[],
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
  fantom: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_FANTOM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_FANTOM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_FANTOM_BLOCKBOOK_LIST) as string[],
    ),
  },
  gnosis: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_GNOSIS_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_GNOSIS_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_GNOSIS_BLOCKBOOK_LIST) as string[],
    ),
  },
  inevm: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_INEVM_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_INEVM_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_INEVM_BLOCKBOOK_LIST) as string[],
    ),
  },
  initverse: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_INITVERSE_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_INITVERSE_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_INITVERSE_BLOCKBOOK_LIST) as string[],
    ),
  },
  joc: {
    rpcList: shuffle(JSON.parse(import.meta.env.VITE_JOC_RPC_LIST) as string[]),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_JOC_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_JOC_BLOCKBOOK_LIST) as string[],
    ),
  },
  kava: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_KAVA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_KAVA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_KAVA_BLOCKBOOK_LIST) as string[],
    ),
  },
  linea: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_LINEA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_LINEA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_LINEA_BLOCKBOOK_LIST) as string[],
    ),
  },
  lumia: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_LUMIA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_LUMIA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_LUMIA_BLOCKBOOK_LIST) as string[],
    ),
  },
  mantle: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_MANTLE_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_MANTLE_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_MANTLE_BLOCKBOOK_LIST) as string[],
    ),
  },
  morph: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_MORPH_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_MORPH_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_MORPH_BLOCKBOOK_LIST) as string[],
    ),
  },
  plume: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_LEGACY_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_LEGACY_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_LEGACY_BLOCKBOOK_LIST) as string[],
    ),
  },
  "plume-nitro": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_NITRO_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_NITRO_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_NITRO_BLOCKBOOK_LIST) as string[],
    ),
  },
  "plume-test": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_TEST_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_TEST_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_PLUME_TEST_BLOCKBOOK_LIST) as string[],
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
  scroll: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_SCROLL_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_SCROLL_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_SCROLL_BLOCKBOOK_LIST) as string[],
    ),
  },
  taiko: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_TAIKO_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_TAIKO_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_TAIKO_BLOCKBOOK_LIST) as string[],
    ),
  },
  zchains: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ZCHAINS_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ZCHAINS_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ZCHAINS_BLOCKBOOK_LIST) as string[],
    ),
  },
  "zksync-era": {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_ZKSYNC_ERA_RPC_LIST) as string[],
    ),
    blockscoutApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ZKSYNC_ERA_BLOCKSCOUT_LIST) as string[],
    ),
    blockbookApiList: shuffle(
      JSON.parse(import.meta.env.VITE_ZKSYNC_ERA_BLOCKBOOK_LIST) as string[],
    ),
  },
  sepolia: {
    rpcList: shuffle(
      JSON.parse(import.meta.env.VITE_SEPOLIA_RPC_LIST) as string[],
    ),
  },
};
