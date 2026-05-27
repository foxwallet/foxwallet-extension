// Single-row Dexie record holding the SnarkVM inclusion proving key bytes.
// Persisted once per chain database so subsequent transfer_private executions
// can skip the multi-MB download from keys.provable.com.
export interface InclusionKey {
  id: string;
  proverBytes: Uint8Array;
  proverSha1?: string;
  // URL the bytes were fetched from. Lets us invalidate the cache when the
  // upstream filename (which embeds a version hash) changes.
  sourceUrl: string;
  fetchedAt: number;
}

export const INCLUSION_KEY_ROW_ID = "inclusion";
