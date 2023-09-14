import {
  PBKDF2_KEY_LENGTH,
  PBKDF2_NUM_OF_ITERATIONS,
  WALLET_MASTER_SECRET,
} from "../constants";
import { Cipher } from "../types/keyring";
import { logger } from "./logger";
import { getRandomBytes } from "./randombytes";
import { Buffer } from "buffer";

const crypto = self.crypto;

if (!crypto) {
  throw new Error("crypto not supported in environment");
}

export const generateToken = async (password: string) => {
  const salt = getRandomBytes(128);
  const token = await getToken(password, salt);
  const key = await crypto.subtle.importKey(
    "raw",
    token,
    { name: "AES-CTR", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  const secretBytes = new TextEncoder().encode(WALLET_MASTER_SECRET);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CTR", counter: new Uint8Array(16), length: 64 },
    key,
    secretBytes
  );
  return {
    token: token.toString("hex"),
    cipher: {
      data: Buffer.from(encrypted).toString("hex"),
      salt: Buffer.from(salt).toString("hex"),
    },
  };
};

export const getToken = async (password: string, salt: Buffer) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const passwordHash = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordHash,
    {
      name: "PBKDF2",
    },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_NUM_OF_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    PBKDF2_KEY_LENGTH
  );

  return Buffer.from(derivedBits);
};

export const validateToken = async (token: Buffer, cipher: Cipher) => {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      token,
      { name: "AES-CTR", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CTR", counter: new Uint8Array(16), length: 64 },
      key,
      Buffer.from(cipher.data, "hex")
    );
    const secret = new TextDecoder().decode(decrypted);
    return secret === WALLET_MASTER_SECRET;
  } catch (err) {
    logger.error("validateToken error", (err as Error).message);
    return false;
  }
};
