export interface SyncBlockParams {
  viewKey: string;
  address: string;
  chainId: string;
  begin: number;
  end: number;
}

export interface RecordDetail {
  programId: string;
  plaintext: string;
  content: object;
  nonce: string;
  // check spent or not
  // serialNumber: string;
  // spentTransitionId?: string;
  tag?: string;
  commitment: string;
}

export type RecordDetailWithBlockInfo = RecordDetail & TxMetadata;

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
  txType: "send" | "receive";
  address?: string; // "public" "private to public"
  amount?: string; // "public" "public to private" "private to public"
  // inputCreditRecordSerialNumber?: string[]; // "private" "private to public" "join" "split"
  // inputOtherRecordSerialNumber?: string[]; // for other contracts
}

export type TxHistoryItem = { transitions: TxInfo[] } & {
  feeInfo?: FeeInfo;
} & TxMetadata;

export interface FutureJSON {
  program_id: string;
  function_name: string;
  arguments: string[];
}

export interface OffscreenResp<T> {
  error: null | string;
  data: T | undefined;
}

export enum AleoWorkerMethod {
  INIT_WORKER = "INIT_WORKER",
  SYNC_BLOCKS = "SYNC_BLOCKS",
  // GET_PRIVATE_KEY = "GET_PRIVATE_KEY",
}

export interface AleoWorkerMessage {
  type: AleoWorkerMethod;
  target: "offscreen";
  params: any;
}

export type LogFunc = (type: "log" | "error", ...args: any[]) => void;

export type BlockSpentTags = Omit<TxMetadata, "txId"> & { tags: string[] };

export interface SyncBlockResp {
  range: number[];
  recordsMap: { [key in string]?: RecordDetailWithBlockInfo[] };
  txInfoList: TxHistoryItem[];
  spentRecordTags?: BlockSpentTags[];
  measureMap: {
    [key in string]: { time: number; max: number; count: number };
  };
}

export enum TaskPriority {
  HIGH = 0,
  MEDIUM = 1,
  LOW = 2,
}

export interface TaskParams {
  taskId: number;
  taskName: AleoWorkerMethod;
  priority: TaskPriority;
  timestamp: number;
}