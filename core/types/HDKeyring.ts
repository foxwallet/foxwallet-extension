import { type EncryptedField } from "./EncryptedField";

export interface NewHdKeyringProps {
  token: string;
  walletId: string;
}

export interface ImportHdKeyringProps {
  token: string;
  walletId: string;
  mnemonic: string;
}

export interface RestoreHdKeyringProps {
  walletId: string;
  token: string;
  mnemonic: EncryptedField;
}
