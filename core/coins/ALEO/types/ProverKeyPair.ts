import type { StoredKeyBytes } from "./KeyBytes";

export interface ProverKeyPair {
  proverFile: StoredKeyBytes;
  proverSha1: string;
  verifierFile: StoredKeyBytes;
  verifierSha1: string;
}
