import type { StoredKeyBytes } from "../../../../core/coins/ALEO/types/KeyBytes";

export interface KeyPair {
  proverFile: StoredKeyBytes;
  verifierFile: StoredKeyBytes;
  proverSha1: string;
  verifierSha1: string;
}

export interface AleoProgram {
  programId: string;
  content: string;
  keypairs: {
    [method in string]?: KeyPair;
  };
}
