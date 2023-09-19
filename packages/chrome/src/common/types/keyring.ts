export interface Cipher {
  data: string;
  salt: string;
}

export enum WalletType {
  HD = "HD",
  SIMPLE = "SIMPLE",
}

export type AccountModel = {
  // [WalletType.HD]: HDWallet[];
  // [WalletType.SIMPLE]: SimpleWallet[];
};

export interface KeyringObj {}

export interface Vault {
  cipher?: Cipher;
  keyring?: KeyringObj;
  version?: number;
}
