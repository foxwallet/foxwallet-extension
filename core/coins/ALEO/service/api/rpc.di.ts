import { type FaucetStatus } from "core/coins/ALEO/types/Faucet";

export type Input = {
  type: string;
  id: string;
  tag?: string;
  origin?: Origin;
  value?: string;
};

export type Origin = {
  commitment: string;
};

export type Output = {
  type: string;
  id: string;
  checksum: string;
  value: string;
};

export type Transition = {
  id: string;
  program: string;
  function: string;
  inputs?: Input[];
  outputs?: Output[];
  finalize?: string[];
  proof?: string;
  tpk: string;
  tcm: string;
  fee: number;
};

export type Execution = {
  transitions?: Transition[];
  global_state_root: string;
  proof: string;
};

export type AleoTransactionInfo = {
  type: string;
  id: string;
  execution?: Execution;
  fee?: {
    transition: Transition;
    global_state_root: string;
    proof: string;
  };
};

export type TransactionResp = {
  origin_data: AleoTransactionInfo;
  height: number;
  status: "accepted" | "rejected" | -1;
  timestamp: number;
};

export type RecordsResp = {
  status: number;
  msg: string;
  data: {
    pagination: {
      total: number;
      total_page: number;
      // 默认 50
      page_size: number;
      // 页码从 1 开始
      page: number;
    };
    records: Array<{
      id: string;
      commitment: string;
      plaintext: string;
      spent: boolean;
      record_name: string;
    }>;
  };
};

export type RecordResp = {
  status: number;
  msg: string;
  data: {
    id: string;
    commitment: string;
    program: string;
    plaintext: string;
    spent: boolean;
  };
};

export type PrivateBalanceResp = {
  status: number;
  msg: string;
  data: number;
};

export type RecordType = "all" | "spent" | "unspent";

export type RecordSortMode = "asc" | "desc";

export type CreditRecord = {
  owner: string;
  microcredits: string;
  nonce: string;
};

export type AlphaTokenRecord = {
  token: string;
  amount: string;
};

export type CustomEntry = string | { [key: string]: CustomEntry };

export type CustomRecord = {
  [key: string]: CustomEntry;
};

export type CreditRecordItem = {
  id: string;
  record: CreditRecord;
  commitment: string;
  plaintext: string;
  spent: boolean;
};

export type AlphaTokenRecordItem = {
  id: string;
  record: AlphaTokenRecord;
  commitment: string;
  plaintext: string;
  spent: boolean;
};

export type CustomRecordItem = {
  id: string;
  record: CustomRecord;
  commitment: string;
  plaintext: string;
  spent: boolean;
  recordName?: string;
};

export type ImportWalletResp = {
  status: number;
  msg: string;
  data: string;
};

export type GasFeeResp = {
  status: number;
  msg: string;
  data: string;
};

export type AleoAccountStatusResp = {
  status: number;
  msg: string;
  data: {
    status: "EMPTY" | "PENDING" | "PROCESSING" | "FINISH";
    estimate_time: number;
    estimate_order: number;
    update_time: number;
  };
};

export type AleoTxHistoryResp = {
  status: number;
  msg: string;
  data: Array<{ id: string; transactionId: string }>;
};

export type AleoPriorityFeeResp = {
  status: number;
  msg: string;
  data: {
    height: number;
    recommend: number;
  };
};

export type AleoNodeStatus = {
  syncHeight: number;
  serverHeight: number;
  referenceHeight: number;
};

export type AleoNodeStatusResp = {
  status: number;
  msg: string;
  data: AleoNodeStatus;
};

export type AleoFaucetContentResp = {
  status: number;
  msg: string;
  data: Record<string, string>;
};

export type AleoRequestFaucetResp = {
  status: number;
  msg: string;
  data: string;
};

export type AleoFaucetStatusResp = {
  status: number;
  msg: string;
  data: {
    status: FaucetStatus;
    txid?: string;
  };
};
