import { decryptWithKey, encryptWithKey, generateSalt, keyFromPassword } from "@metamask/browser-passworder"
import { getRandomBytes } from "./random";
import { EncryptedField } from "../types/EncryptedField";

export const encryptStr = async (passwordHash: string, data: string): Promise<EncryptedField | undefined> => {
  if (!data) {
    return undefined;
  }
  const salt = generateSalt(32);
  const key = await keyFromPassword(passwordHash, salt);
  const payload = await encryptWithKey(key, { key: data });
  payload.salt = salt;
  return payload as EncryptedField;
}

export const decryptStr = async (passwordHash: string, payload: EncryptedField): Promise<string> => {
  const { salt } = payload;
  const key = await keyFromPassword(passwordHash, salt);
  const result = await decryptWithKey<{key: string}>(key, payload);
  return result.key;
}