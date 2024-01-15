export interface KeyPair {
  proverFile: Uint8Array;
  verifierFile: Uint8Array;
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
