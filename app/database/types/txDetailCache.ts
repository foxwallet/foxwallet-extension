import type { AleoTransaction } from "core/coins/ALEO/types/Transaction";

export interface AleoTxDetailCacheRow {
  txId: string;
  tx: AleoTransaction;
  cachedAt: number;
}
