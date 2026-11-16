import {
  type AleoTransaction,
  type AleoTransactionWithHeight,
} from "../../types/Transaction";

export function normalizeTransaction(
  value: unknown,
  expectedId: string,
): AleoTransactionWithHeight | undefined {
  if (value === null) return undefined;
  if (typeof value !== "object") throw new Error("Invalid Aleo transaction");
  const tx = value as Record<string, unknown>;
  if (tx.id !== expectedId || typeof tx.status !== "string") {
    throw new Error("Invalid Aleo transaction identity or status");
  }
  const status = tx.status.toLowerCase();
  const origin = tx as unknown as AleoTransaction;
  if (status === "pending" || status === "unconfirmed") {
    return { origin_data: origin, status: -1, height: 0, timestamp: 0 };
  }
  if (!["accepted", "confirmed", "rejected"].includes(status)) {
    throw new Error(`Unknown Aleo transaction status: ${tx.status}`);
  }
  const height = tx.block_height;
  const timestamp = Number(tx.block_timestamp);
  if (
    !Number.isSafeInteger(height) ||
    (height as number) < 0 ||
    tx.block_timestamp == null ||
    !Number.isFinite(timestamp) ||
    timestamp < 0
  ) {
    throw new Error("Invalid Aleo transaction block metadata");
  }
  return {
    origin_data: origin,
    status: status === "rejected" ? "rejected" : "accepted",
    height: height as number,
    timestamp: timestamp * 1000,
  };
}
