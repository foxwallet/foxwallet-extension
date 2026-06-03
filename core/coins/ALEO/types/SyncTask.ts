import { type AleoTxAddressType } from "./History";

export interface RecordDetail {
  commitment: string;
  programId: string;
  functionName: string;
  plaintext: string;
  ciphertext: string;
  content: { [key in string]: any };
  nonce: string;
  tag: string;
  transactionId: string;
  transitionId: string;
  height: number;
  timestamp: number;
  recordName?: string;
  outputIndex?: number;
}

export interface RecordTrimDetail {
  commitment: string;
  plaintext: string;
  ciphertext: string;
  content: { [key in string]: any };
  nonce: string;
  tag: string;
  height: number;
}

export type RecordDetailWithSpent = RecordDetail & {
  spent: boolean;
  parsedContent?: { [key in string]: any };
};

export interface FeeInfo {
  feeType: "fee_public" | "fee_private";
  fee: string;
  baseFee: string;
  priorityFee: string;
}

export interface TxMetadata {
  txId: string;
  height: number;
  timestamp: number;
}

export interface TxInfo {
  program: string;
  function: string;
  txType: AleoTxAddressType;
  address?: string; // "public" "private to public"
  amount?: string; // "public" "public to private" "private to public"
  // inputCreditRecordSerialNumber?: string[]; // "private" "private to public" "join" "split"
  // inputOtherRecordSerialNumber?: string[]; // for other contracts
}

export type AleoTxHistoryItem = { transitions: TxInfo[] } & {
  feeInfo?: FeeInfo;
} & TxMetadata;

export interface FutureJSON {
  program_id: string;
  function_name: string;
  arguments: string[];
}
