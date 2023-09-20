import { CoinType, EncryptedKeyPairWithViewKey, EncryptedField } from "@foxwallet/core/types";

export enum WalletType {
  HD = "HD",
  SIMPLE = "SIMPLE",
}

export type AccountWithViewKey = Omit<EncryptedKeyPairWithViewKey, "privateKey" | "viewKey"> & {
  accountName: string;
}

export interface BaseWallet {
  walletType: WalletType;
  walletId: string;
  walletName: string;
  accountsMap: {
    [CoinType.ALEO]: AccountWithViewKey[]
  };
}

export interface HDWallet extends BaseWallet {
  walletType: WalletType.HD;
}

export interface SimpleWallet extends BaseWallet {}

export interface AccountModel {
  [WalletType.HD]: HDWallet[];
  [WalletType.SIMPLE]: SimpleWallet[];
}