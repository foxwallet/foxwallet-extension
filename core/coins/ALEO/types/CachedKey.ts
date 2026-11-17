import type { ChunkedKeyBytes } from "./KeyBytes";

export interface CachedKey {
  id: string;
  bytes: ChunkedKeyBytes;
  checksum: string;
}
