import { type AleoTxAddressType } from "./History";

export enum TaskPriority {
  HIGH = 0,
  MEDIUM = 1,
  LOW = 2,
}

export interface SyncRecordParams {
  viewKey: string;
  address: string;
  begin: number;
  end: number;
  batchId: string;
  priority: TaskPriority;
}

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

// export interface SyncRecordResp {
//   range: number[];
//   recordsMap: { [key in string]?: RecordDetail[] };
//   txInfoList: AleoTxHistoryItem[];
//   spentRecordTags?: BlockSpentTags[];
//   measureMap: {
//     [key in string]: { time: number; max: number; count: number };
//   };
// }

export type SyncRecordResp = SyncRecordParams & SyncRecordResult;

export interface SyncRecordResult {
  recordsMap: {
    [program in string]?: { [commitment in string]?: RecordDetail };
  };
  range: number[];
}

export type SyncRecordResultWithDuration = SyncRecordResult & {
  measure: {
    totalTime: number;
    requestTime: number;
  };
};

export type AleoAddressInfo = {
  recordsMap: {
    [program in string]?: { [commitment in string]?: RecordDetailWithSpent };
  };
  range: number[];
};

export interface AddressSyncRecordResp {
  chainId: string;
  addressResultMap: {
    [x in string]: SyncRecordResp;
  };
  measureMap: {
    [key in string]: { time: number; max: number; count: number };
  };
}

export interface TaskParams {
  priority: TaskPriority;
  timestamp: number;
}

export interface TaskParamWithRange {
  address: string[]; // easier to change priority
  begin: number;
  end: number;
  chainId: string;
  priority: TaskPriority;
  timestamp: number;
}

export type WorkerSyncTask = TaskParamWithRange & {
  syncParams: SyncRecordParams[];
};
