import { CoinType, EncryptedKeyPairWithViewKey, EncryptedField } from "@foxwallet/core/types";
import { Mnemonic } from "@foxwallet/core/wallet/mnemonic";


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
}

export type DisplayAccount = Omit<AccountWithViewKey, "privateKey" | "viewKey">;

export interface BaseWallet {
  walletType: WalletType;
  walletId: string;
  walletName: string;
  accountsMap: {
    [CoinType.ALEO]: AccountWithViewKey[]
  };
}

export type DisplayBaseWallet = Omit<BaseWallet, "accountsMap"> & {
  accountsMap: {
    [CoinType.ALEO]: DisplayAccount[]
  };
}

export interface HDWallet extends BaseWallet {
  walletType: WalletType.HD;
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
