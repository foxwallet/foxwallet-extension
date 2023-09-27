import { AccountOption } from "./CoinBasic";
import { CoinType } from "./CoinType";
import { EncryptedField } from "./EncryptedField";

export type RawKeyPair = {
  index: number;
  accountId: string;
  privateKey: string;
  address: string;
};

export type RawKeyPairWithPublicKey = RawKeyPair & {
  publicKey: string;
};

export type RawKeyPairWithViewKey = RawKeyPair & {
  viewKey: string;
};

export type EncryptedKeyPair = {
  index: number;
  accountId: string;
  privateKey: EncryptedField;
  address: string;
};

export type EncryptedKeyPairWithPublicKey = EncryptedKeyPair & {
  publicKey: string;
};

export type EncryptedKeyPairWithViewKey = EncryptedKeyPair & {
  viewKey: EncryptedField;
};

export type HDWalletProps<T extends CoinType> = {
  symbol: T;
};
