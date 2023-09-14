export type Cipher = {
  data: string;
  salt: string;
};

export type KeyringObj = {};

export type Vault = {
  cipher?: Cipher;
  keyring?: KeyringObj;
  version?: number;
};
