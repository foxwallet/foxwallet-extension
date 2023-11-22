import { AleoTxStatus } from "./Tranaction";

export enum AleoHistoryType {
  ON_CHAIN = "on_chain",
  LOCAL = "local",
}

export enum AleoTxAddressType {
  SEND = "send",
  RECEIVE = "receive",
}

export interface AleoOnChainHistoryItem {
  type: AleoHistoryType.ON_CHAIN;
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
}

export type AleoHistoryItem = AleoOnChainHistoryItem | AleoLocalHistoryItem;
