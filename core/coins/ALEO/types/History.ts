import { type AleoTxStatus } from "./Transaction";

export enum AleoHistoryType {
  ON_CHAIN = "on_chain",
  LOCAL = "local",
}

export enum AleoTxAddressType {
  SEND = "send",
  RECEIVE = "receive",
}

export enum AleoTxType {
  EXECUTION = "execution",
  DEPLOYMENT = "deployment",
}

export enum AleoTxFunctionNameType {
  Join = "join",
  Split = "split",
  Public = "transfer_public",
  Private = "transfer_private",
  PublicToPrivate = "transfer_public_to_private",
  PrivateToPublic = "transfer_private_to_public",
}

export interface AleoOnChainHistoryItem {
  type: AleoHistoryType.ON_CHAIN;
  txType: AleoTxType;
  txId: string;
  programId: string;
  functionName: AleoTxFunctionNameType;
  height: number;
  timestamp: number;
  addressType: AleoTxAddressType;
  amount?: string;
  status: AleoTxStatus;
  from?: string;
  to?: string;
}

export interface AleoLocalHistoryItem {
  type: AleoHistoryType.LOCAL;
  txType: AleoTxType;
  localId: string;
  txId?: string;
  error?: string;
  programId: string;
  functionName: AleoTxFunctionNameType;
  inputs: string[];
  timestamp: number;
  addressType: AleoTxAddressType.SEND;
  amount?: string;
  tokenId: string;
  status: AleoTxStatus;
  notification: boolean;
}

export type AleoHistoryItem = AleoOnChainHistoryItem | AleoLocalHistoryItem;
