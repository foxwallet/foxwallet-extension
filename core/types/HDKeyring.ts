import { EncryptedField } from "./EncryptedField";

export type NewHdKeyringProps = {
  token: string;
  walletId: string;
};

export type ImportHdKeyringProps = {
  token: string;
  walletId: string;
  mnemonic: string;
};

export type RestoreHdKeyringProps = {
  walletId: string;
  token: string;
  mnemonic: EncryptedField;
};
