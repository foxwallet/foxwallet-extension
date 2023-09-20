import { EncryptedField } from "./EncryptedField";

export type NewHdKeyringProps = {
  hash: string;
  walletId: string;
};

export type RestoreHdKeyringProps = {
  walletId: string;
  hash: string;
  mnemonic: EncryptedField;
}