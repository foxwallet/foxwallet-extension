export enum TaskPriority {
  HIGH = 0,
  MEDIUM = 1,
  LOW = 2,
}

export interface AleoSyncAccount {
  walletId: string;
  accountId: string;
  address: string;
  viewKey: string;
  priority: TaskPriority;
  height?: number;
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
  programId: string;
  plaintext: string;
  content: { [key in string]: any };
  nonce: string;
  // check spent or not
  // serialNumber: string;
  // spentTransitionId?: string;
  tag: string;
  commitment: string;
  recordName?: string;
}

export type RecordDetailWithSpent = RecordDetail &
  TxMetadata & {
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

export enum AleoTxAddressType {
  SEND = "send",
  RECEIVE = "receive",
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

export type BlockSpentTags = Omit<TxMetadata, "txId"> & { tags: string[] };

// export interface SyncRecordResp {
//   range: number[];
//   recordsMap: { [key in string]?: RecordDetail[] };
//   txInfoList: AleoTxHistoryItem[];
//   spentRecordTags?: BlockSpentTags[];
//   measureMap: {
//     [key in string]: { time: number; max: number; count: number };
//   };
// }

export type SyncRecordResp = SyncRecordParams & SyncBlockResult;

export interface SyncBlockResult {
  recordsMap: { [program in string]?: RecordDetail[] };
  spentRecordTags: BlockSpentTags[];
  txInfoList: AleoTxHistoryItem[];
  range: number[];
}

export type SyncRecordResultWithDuration = SyncBlockResult & {
  measure: {
    totalTime: number;
    requestTime: number;
  };
};

export type AleoAddressInfo = {
  recordsMap: {
    [program in string]?: { [commitment in string]?: RecordDetailWithSpent };
  };
  spentRecordTags: string[];
  txInfoList: AleoTxHistoryItem[];
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

export interface AleoSendTxParams {
  privateKey: string;
  address: string;
  localId: string;
  chainId: string;
  programId: string;
  functionName: string;
  inputs: string[];
  baseFee: string;
  priorityFee: string;
  feeRecord: string | null;
  timestamp: number;
  amount?: string;
}

export type Input = {
  type: string;
  id: string;
  tag?: string;
  origin?: Origin;
  value?: string;
};

export type Output = {
  type: string;
  id: string;
  checksum: string;
  value: string;
};

export type Origin = {
  commitment: string;
};

export type Transition = {
  id: string;
  program: string;
  function: string;
  inputs?: Input[];
  outputs?: Output[];
  proof: string;
  tpk: string;
  tcm: string;
};

export type Fee = {
  transition: Transition;
  global_state_root: string;
  proof: string;
};

export type Execution = {
  edition: number;
  transitions?: Transition[];
};

export type Transaction = {
  type: string;
  id: string;
  execution: Execution;
  fee?: Fee;
};

export type AleoTransaction = Transaction;

export enum AleoHistoryType {
  ON_CHAIN = "on_chain",
  LOCAL = "local",
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

export type AleoLocalTxInfo = Omit<
  AleoSendTxParams,
  "privateKey" | "chainId"
> & {
  error?: string;
  status: AleoTxStatus;
  timestamp: number;
  transaction?: AleoTransaction;
};

export type AleoTxWithTime = Transaction & {
  status: AleoTxStatus;
  timestamp: number;
};

export enum AleoTxStatus {
  QUEUED = "Queued",
  GENERATING_PROVER_FILES = "Generating Prover Files",
  GENERATING_TRANSACTION = "Generating Transaction",
  BROADCASTING = "Broadcasting",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
  FINALIZD = "Finalized",
  FAILED = "Failed",
  UNACCEPTED = "Unaccepted",
}

export interface ProverKeyPair {
  proverFile: Uint8Array;
  proverSha1: string;
  verifierFile: Uint8Array;
  verifierSha1: string;
}

export type Block = {
  block_hash: string;
  previous_hash: string;
  header: Header;
  transactions?: ConfirmedTransaction[];
  signature: string;
};
export type Header = {
  previous_state_root: string;
  transactions_root: string;
  metadata: Metadata;
};
export type Metadata = {
  network: number;
  round: number;
  height: number;
  coinbase_target: number;
  proof_target: number;
  timestamp: number;
};

export type ConfirmedTransaction = {
  status: string;
  type: string;
  index: number;
  transaction: Transaction;
};

export enum MessageOrigin {
  OFFSCREEN_TO_BACKGROUND = "offscreen_to_background",
  OFFSCREEN_TX_TO_BACKGROUND = "offscreen_tx_to_background",
  BACKGROUND_TO_OFFSCREEN = "background_to_offscreen",
  BACKGROUND_TO_OFFSCREEN_TX = "background_to_offscreen_tx",
}

export interface OffscreenMessagePayload<T = any> {
  error: null | string;
  data: T | null;
}

export enum OffscreenMessageType {
  ERROR = "error",
  RESPONSE = "response",
}

export interface OffscreenMessage<T = any> {
  type: OffscreenMessageType;
  origin: MessageOrigin;
  payload: OffscreenMessagePayload<T>;
}

export enum OffscreenMethod {
  INIT_WORKER = "init_worker",
  SEND_TX = "send_tx",
  DEPLOY = "deploy",
  IS_SENDING_TX = "is_sending_tx",
}

export interface BackgroundMessage<T = any> {
  type: OffscreenMethod;
  origin: MessageOrigin;
  payload: T;
}

export enum InnerChainUniqueId {
  ALEO_TESTNET3 = "ALEO_TESTNET3",
}

export interface AleoRequestDeploymentParams {
  privateKey: string;
  chainId: string;
  address: string;
  localId: string;
  program: string;
  programId: string;
  baseFee: string;
  priorityFee: string;
  feeRecord: string | null;
  timestamp: number;
}
