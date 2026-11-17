import {
  type AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Transaction";

// Run in the background so closing the wallet page does not abandon the batch.
// Each record is a separate fee-free transaction, as required by consensus.
export async function runRecordUpgrades(
  transactions: AleoLocalTxInfo[],
  send: (
    tx: AleoLocalTxInfo,
  ) => Promise<
    { payload?: { error?: string | null; data?: unknown } } | undefined
  >,
  save: (tx: AleoLocalTxInfo) => Promise<void>,
) {
  for (const tx of transactions) {
    try {
      const response = await send(tx);
      if (!response?.payload?.data || response.payload.error) {
        throw new Error(
          response?.payload?.error || "Aleo record upgrade failed",
        );
      }
    } catch (error) {
      try {
        await save({
          ...tx,
          status: AleoTxStatus.FAILED,
          error: (error instanceof Error ? error.message : String(error)).slice(
            0,
            1000,
          ),
        });
      } catch {
        console.error("[RecordUpgrade] Failed to persist upgrade status");
      }
    }
  }
}
