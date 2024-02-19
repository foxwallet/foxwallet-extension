import { AleoTxStatus } from "./Transaction";

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

export interface AleoOnChainHistoryItem {
  type: AleoHistoryType.ON_CHAIN;
  txType: AleoTxType;
  txId: string;
  programId: string;
  functionName: string;
  height: number;
  timestamp: number;
  addressType: AleoTxAddressType;
  amount?: string;
  status: AleoTxStatus;
}

export interface AleoLocalHistoryItem {
  type: AleoHistoryType.LOCAL;
  txType: AleoTxType;
  localId: string;
  txId?: string;
  error?: string;
  programId: string;
  functionName: string;
  inputs: string[];
  timestamp: number;
  addressType: AleoTxAddressType.SEND;
  amount?: string;
  status: AleoTxStatus;
  notification: boolean;
}

export type AleoHistoryItem = AleoOnChainHistoryItem | AleoLocalHistoryItem;
