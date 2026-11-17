import type { Table } from "dexie";
import type {
  AleoKeyChunk,
  ChunkedKeyBytes,
  StoredKeyBytes,
} from "../types/KeyBytes";

export const KEY_CHUNK_SIZE = 64 * 1024 * 1024;
type ChunkTable = Table<AleoKeyChunk, [string, number]>;

// Call inside the transaction that updates the owning cache entry, so a
// failed chunk write leaves both the old manifest and old bytes intact.
export async function writeKeyBytes(
  table: ChunkTable,
  bytes: Uint8Array,
): Promise<ChunkedKeyBytes> {
  const keyId = crypto.randomUUID();
  const chunkCount = Math.ceil(bytes.byteLength / KEY_CHUNK_SIZE);
  for (let index = 0; index < chunkCount; index++) {
    const start = index * KEY_CHUNK_SIZE;
    await table.put({
      keyId,
      index,
      // subarray() would serialize the entire backing buffer, exceeding the
      // browser limit even when the view itself is only a single chunk.
      bytes: bytes.slice(start, start + KEY_CHUNK_SIZE),
    });
  }
  return { kind: "chunks-v1", keyId, byteLength: bytes.byteLength, chunkCount };
}

export async function readKeyBytes(
  table: ChunkTable,
  stored: StoredKeyBytes,
): Promise<Uint8Array | null> {
  if (stored instanceof Uint8Array) return stored;
  if (stored instanceof Blob) return new Uint8Array(await stored.arrayBuffer());
  if (
    stored.kind !== "chunks-v1" ||
    typeof stored.keyId !== "string" ||
    !Number.isSafeInteger(stored.byteLength) ||
    stored.byteLength < 0 ||
    stored.chunkCount !== Math.ceil(stored.byteLength / KEY_CHUNK_SIZE)
  ) {
    return null;
  }
  // Keep all chunk reads in one snapshot while another worker replaces a key.
  return await table.db.transaction("r", table, async () => {
    const count = await table.where("keyId").equals(stored.keyId).count();
    if (count !== stored.chunkCount) return null;
    const bytes = new Uint8Array(stored.byteLength);
    for (let index = 0; index < stored.chunkCount; index++) {
      const chunk = await table.get([stored.keyId, index]);
      const offset = index * KEY_CHUNK_SIZE;
      const expected = Math.min(KEY_CHUNK_SIZE, stored.byteLength - offset);
      if (!chunk || chunk.bytes.byteLength !== expected) return null;
      bytes.set(chunk.bytes, offset);
    }
    return bytes;
  });
}

export async function deleteKeyBytes(
  table: ChunkTable,
  stored: StoredKeyBytes | undefined,
): Promise<void> {
  if (stored && "kind" in stored && stored.kind === "chunks-v1") {
    await table.where("keyId").equals(stored.keyId).delete();
  }
}
