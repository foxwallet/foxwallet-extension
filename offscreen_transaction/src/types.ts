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
export interface SyncBlockParams {
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

export type RecordDetailWithBlockInfo = RecordDetail & TxMetadata;

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

// export interface SyncBlockResp {
//   range: number[];
//   recordsMap: { [key in string]?: RecordDetailWithBlockInfo[] };
//   txInfoList: AleoTxHistoryItem[];
//   spentRecordTags?: BlockSpentTags[];
//   measureMap: {
//     [key in string]: { time: number; max: number; count: number };
//   };
// }

export type SyncBlockResp = SyncBlockParams & SyncBlockResult;

export interface SyncBlockResult {
  recordsMap: { [program in string]?: RecordDetailWithBlockInfo[] };
  spentRecordTags: BlockSpentTags[];
  txInfoList: AleoTxHistoryItem[];
  range: number[];
}

export type SyncBlockResultWithDuration = SyncBlockResult & {
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

export interface AddressSyncBlockResp {
  chainId: string;
  addressResultMap: {
    [x in string]: SyncBlockResp;
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
  syncParams: SyncBlockParams[];
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

export type AleoLocalTxInfo = Omit<
  AleoSendTxParams,
  "privateKey" | "chainId" | "address"
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
}

export interface IAleoStorage {
  getAccountsAddress(chainId: string): Promise<string[]>;
  getAccountInfo(
    chainId: string,
    address: string,
  ): Promise<AleoSyncAccount | undefined>;

  setAccountInfo(
    chainId: string,
    account: AleoSyncAccount,
  ): Promise<AleoSyncAccount>;

  getAleoBlockRanges(chainId: string, address: string): Promise<string[]>;
  setAleoBlocks(
    chainId: string,
    address: string,
    key: string,
    blockInfo: SyncBlockResultWithDuration,
  ): Promise<SyncBlockResultWithDuration>;

  getAleoBlockInfo(
    chainId: string,
    address: string,
    key: string,
  ): Promise<SyncBlockResultWithDuration | null>;

  getAddressInfo(
    chainId: string,
    address: string,
  ): Promise<AleoAddressInfo | null>;

  setAddressInfo(
    chainId: string,
    address: string,
    info: AleoAddressInfo,
  ): Promise<AleoAddressInfo>;

  setAddressLocalTx(
    chainId: string,
    address: string,
    info: AleoLocalTxInfo,
  ): Promise<void>;

  getAddressLocalTxIds(chainId: string, address: string): Promise<string[]>;

  getAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<AleoLocalTxInfo | null>;

  removeAddressLocalTx(
    chainId: string,
    address: string,
    localId: string,
  ): Promise<void>;

  getProgramContent(chainId: string, programId: string): Promise<string | null>;

  setProgramContent(
    chainId: string,
    programId: string,
    program: string,
  ): Promise<void>;
}

export interface ProverKeyPair {
  proverFile: Uint8Array;
  proverSha1: string;
  verifierFile: Uint8Array;
  verifierSha1: string;
}

export enum AutoSwitchServiceType {
  RPC = "rpc",
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
}

export interface BackgroundMessage<T = any> {
  type: OffscreenMethod;
  origin: MessageOrigin;
  payload: T;
}

export enum InnerChainUniqueId {
  ALEO_TESTNET_3 = "aleo_testnet_3",
}
