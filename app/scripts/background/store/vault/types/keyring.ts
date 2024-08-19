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
};

export type ComposedAccount = AccountWithViewKey;

export type DisplayComposedAccount = Omit<
  ComposedAccount,
  "privateKey" | "viewKey"
>;

export type GroupAccount = {
  groupId: string;
  groupName: string;
  index: number;
  accounts: Array<ComposedAccount>;
};

export type GroupAccountMeta = {
  walletType: WalletType;
  walletId: string;
  groupId: string;
};

export type AccountMeta = {
  walletType: WalletType;
  walletId: string;
  groupId: string;
  accountId: string;
};

export type DisplayGroupAccount = {
  groupId: string;
  groupName: string;
  index: number;
  accounts: Array<DisplayComposedAccount>;
};

export type OneMatchGroupAccount = {
  wallet: Omit<DisplayBaseWallet, "groupAccounts">;
  group: DisplayGroupAccount;
};

export type OneMatchAccount = {
  wallet: Omit<DisplayBaseWallet, "groupAccounts">;
  group: Omit<DisplayGroupAccount, "accounts">;
  account: DisplayComposedAccount;
};

export interface BaseWallet {
  walletType: WalletType;
  walletId: string;
  walletName: string;
  groupAccounts: GroupAccount[];
}

export type DisplayBaseWallet = Omit<BaseWallet, "groupAccounts"> & {
  groupAccounts: DisplayGroupAccount[];
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
