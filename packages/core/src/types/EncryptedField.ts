import { EncryptionResult } from "@metamask/browser-passworder";

export type EncryptedField = EncryptionResult & {
  salt: string;
};