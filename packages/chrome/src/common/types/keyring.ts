export interface Cipher {
  data: string;
  salt: string;
}


export interface KeyringObj {}

export interface Vault {
  cipher?: Cipher;
  keyring?: KeyringObj;
  version?: number;
}
