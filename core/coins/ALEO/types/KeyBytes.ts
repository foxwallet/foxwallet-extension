export interface ChunkedKeyBytes {
  kind: "chunks-v1";
  keyId: string;
  byteLength: number;
  chunkCount: number;
}

// Older caches contain inline arrays or Blobs; new writes use chunk references.
export type StoredKeyBytes = Uint8Array | Blob | ChunkedKeyBytes;

export interface AleoKeyChunk {
  keyId: string;
  index: number;
  bytes: Uint8Array;
}
