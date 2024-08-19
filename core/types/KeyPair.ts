import { AccountOption } from "./CoinBasic";
import { type CoinType } from "./CoinType";
import { type EncryptedField } from "./EncryptedField";

export interface RawKeyPair {
  index: number;
  accountId: string;
  privateKey: string;
  address: string;
}

export type RawKeyPairWithPublicKey = RawKeyPair & {
  publicKey: string;
};

export type RawKeyPairWithViewKey = RawKeyPair & {
  viewKey: string;
};

export interface EncryptedKeyPair {
  accountId: string;
  index: number;
  privateKey: EncryptedField;
  address: string;
  coinType: CoinType;
  option: AccountOption[CoinType];
}

export type EncryptedKeyPairWithPublicKey = EncryptedKeyPair & {
  publicKey: string;
};

export type EncryptedKeyPairWithViewKey = EncryptedKeyPair & {
  viewKey: string;
};

export interface HDWalletProps<T extends CoinType> {
  symbol: T;
}
