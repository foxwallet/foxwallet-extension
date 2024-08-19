import { CoinType, EncryptedField } from "core/types";
import { EncryptedKeyPairWithViewKeyV1 } from "core/types/KeyPairV1";

export interface Cipher {
  data: string;
  salt: string;
}

export enum WalletType {
  HD = "HD",
  SIMPLE = "SIMPLE",
}

export type AccountWithViewKeyV1 = EncryptedKeyPairWithViewKeyV1 & {
  accountName: string;
};

export type DisplayAccountV1 = Omit<
  AccountWithViewKeyV1,
  "privateKey" | "viewKey"
>;

/**
 * @deprecated
 */
export type SelectedAccount = DisplayAccountV1 & {
  walletId: string;
  coinType: CoinType;
};

export interface BaseWalletV1 {
  walletType: WalletType;
  walletId: string;
  walletName: string;
  accountsMap: {
    [CoinType.ALEO]: AccountWithViewKeyV1[];
  };
}

export type DisplayBaseWalletV1 = Omit<BaseWalletV1, "accountsMap"> & {
  accountsMap: {
    [CoinType.ALEO]: DisplayAccountV1[];
  };
};

export interface HDWalletV1 extends BaseWalletV1 {
  walletType: WalletType.HD;
  origin: "import" | "create";
  mnemonic: EncryptedField;
}

export type DisplayWalletV1 = DisplayBaseWalletV1 & {
  mnemonic?: string;
};

export interface SimpleWalletV1 extends BaseWalletV1 {}

export interface KeyringObjV1 {
  [WalletType.HD]?: HDWalletV1[];
  [WalletType.SIMPLE]?: SimpleWalletV1[];
  version?: number;
}

export interface DisplayKeyringV1 {
  [WalletType.HD]?: DisplayWalletV1[];
  [WalletType.SIMPLE]?: DisplayWalletV1[];
}

export enum VaultKeys {
  cipher = "cipher",
  keyring = "keyring",
}

export interface VaultV1 {
  [VaultKeys.cipher]?: Cipher;
  [VaultKeys.keyring]?: KeyringObjV1;
}

export enum AccountMethod {
  CREATE = "create",
  IMPORT = "import",
  ADD = "add",
  REGENERATE = "regenerate",
}
