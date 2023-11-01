export interface SyncBlockParams {
  privateKey: string;
  begin: number;
  end: number;
}

export interface RecordDetail {
  plaintext: string;
  content: object;
  nonce: string;
  // Easy to check spent or not
  serialNumber: string;
  spentTransitionId?: string;
}

export interface FeeInfo {
  feeType: "fee_public" | "fee_private";
  fee: bigint;
  baseFee: bigint;
  priorityFee: bigint;
}

export interface TxMetadata {
  txId: string;
  height: number;
  timestamp: number;
}

export interface TxInfo {
  program: string;
  function: string;
  txType: "send" | "receive";
  address?: string; // "public" "private to public"
  amount?: bigint; // "public" "public to private" "private to public"
  // inputCreditRecordSerialNumber?: string[]; // "private" "private to public" "join" "split"
  // inputOtherRecordSerialNumber?: string[]; // for other contracts
}

export type TxHistoryItem = { transitions: TxInfo[] } & {
  feeInfo?: FeeInfo;
} & TxMetadata;
