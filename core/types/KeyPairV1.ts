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

export interface EncryptedKeyPairV1 {
  accountId: string;
  index: number;
  privateKey: EncryptedField;
  address: string;
}

export type EncryptedKeyPairWithPublicKeyV1 = EncryptedKeyPairV1 & {
  publicKey: string;
};

export type EncryptedKeyPairWithViewKeyV1 = EncryptedKeyPairV1 & {
  viewKey: string;
};

export interface HDWalletProps<T extends CoinType> {
  symbol: T;
}
