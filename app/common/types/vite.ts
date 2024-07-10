/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALEO_RPC_LIST: string;
  readonly VITE_ALEO_SYNC_API_LIST: string;
  readonly VITE_ALEO_WALLET_API_LIST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
