import {
  PrivateKey,
  RecordCiphertext,
  // Future,
  ViewKey,
} from "@provablehq/aleo_wasm_mainnet";
import { Future } from "aleo_wasm_mainnet";
import { type FutureJSON } from "./aleo.di";

export const parsePrivateKey = (privateKeyStr: string): PrivateKey => {
  try {
    const privateKey = PrivateKey.from_string(privateKeyStr);
    return privateKey;
  } catch (err) {
    throw new Error("Invalid private key");
  }
};

export const parseViewKey = (viewKeyStr: string): ViewKey => {
  try {
    const viewKey = ViewKey.from_string(viewKeyStr);
    return viewKey;
  } catch (err) {
    throw new Error("Invalid view key");
  }
};

export const parseU64 = (u64?: string): bigint => {
  if (!u64) {
    return 0n;
  }
  try {
    return BigInt(u64.slice(0, -3));
  } catch (err) {
    console.log("===> parseU64 error: ", err);
    return 0n;
  }
};

export const parseFuture = (futureStr?: string): FutureJSON | undefined => {
  if (!futureStr) {
    return undefined;
  }
  try {
    const future = Future.fromString(futureStr);
    const futureObj = JSON.parse(future.toJSON());
    return futureObj;
  } catch (err) {
    console.log("===> parseFuture error: ", err);
    return undefined;
  }
};

export const parseRecordCiphertext = (recordCiphertextStr: string) => {
  try {
    return RecordCiphertext.fromString(recordCiphertextStr);
  } catch (err) {
    console.log("===> parseRecordCiphertext error: ", err);
    return undefined;
  }
};
