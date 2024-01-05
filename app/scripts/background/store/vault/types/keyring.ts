import {
  CoinType,
  EncryptedKeyPairWithViewKey,
  EncryptedField,
} from "core/types";

export interface Cipher {
  data: string;
  salt: string;
}

export enum WalletType {
  HD = "HD",
  SIMPLE = "SIMPLE",
}

export type AccountWithViewKey = EncryptedKeyPairWithViewKey & {
  accountName: string;
  hide: boolean;
};

export type DisplayAccount = Omit<AccountWithViewKey, "privateKey" | "viewKey">;

export type SelectedAccount = DisplayAccount & {
  walletId: string;
  coinType: CoinType;
};

export interface BaseWallet {
  walletType: WalletType;
  walletId: string;
  walletName: string;
  accountsMap: {
    [CoinType.ALEO]: AccountWithViewKey[];
  };
}

export type DisplayBaseWallet = Omit<BaseWallet, "accountsMap"> & {
  accountsMap: {
    [CoinType.ALEO]: DisplayAccount[];
  };
};

export interface HDWallet extends BaseWallet {
  walletType: WalletType.HD;
  origin: "import" | "create";
  mnemonic: EncryptedField;
}

export type DisplayWallet = DisplayBaseWallet & {
  mnemonic?: string;
};

export interface SimpleWallet extends BaseWallet {}

export interface KeyringObj {
  [WalletType.HD]?: HDWallet[];
  [WalletType.SIMPLE]?: SimpleWallet[];
  version?: number;
}

export interface DisplayKeyring {
  [WalletType.HD]?: DisplayWallet[];
  [WalletType.SIMPLE]?: DisplayWallet[];
}

export enum VaultKeys {
  cipher = "cipher",
  keyring = "keyring",
}

export interface Vault {
  [VaultKeys.cipher]?: Cipher;
  [VaultKeys.keyring]?: KeyringObj;
}

export enum AccountMethod {
  CREATE = "create",
  IMPORT = "import",
  ADD = "add",
  REGENERATE = "regenerate",
}
