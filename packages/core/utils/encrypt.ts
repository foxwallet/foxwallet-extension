import { decryptWithKey, encryptWithKey, generateSalt, keyFromPassword } from "@metamask/browser-passworder"
import { getRandomBytes } from "./random";
import { EncryptedField } from "../types/EncryptedField";

export const encryptStr = async (token: string, data: string): Promise<EncryptedField | undefined> => {
  if (!data) {
    return undefined;
  }
  const salt = generateSalt(32);
  const key = await keyFromPassword(token, salt);
  const payload = await encryptWithKey(key, { key: data });
  payload.salt = salt;
  return payload as EncryptedField;
}

export const decryptStr = async (token: string, payload: EncryptedField): Promise<string> => {
  const { salt } = payload;
  const key = await keyFromPassword(token, salt);
  const result = await decryptWithKey<{key: string}>(key, payload);
  return result.key;
}