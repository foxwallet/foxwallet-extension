import { Execution } from "./AleoExecution";
import { Fee } from "./AleoFee";
import { AleoDeploymentInTx } from "./Deployment";
import { AleoTxType } from "./History";

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

export type AleoTransaction = {
  type: string;
  id: string;
  execution?: Execution;
  deployment: AleoDeploymentInTx;
  fee?: Fee;
};

export type AleoTransactionWithHeight = {
  height: number;
  status: "accepted" | "rejected" | -1;
  timestamp: number;
  origin_data: AleoTransaction;
};

export type AleoLocalTxInfo = Omit<
  AleoSendTxParams,
  "privateKey" | "chainId"
> & {
  error?: string;
  status: AleoTxStatus;
  timestamp: number;
  transaction?: AleoTransaction;
  txType: AleoTxType;
};

export type AleoTxWithTime = AleoTransaction & {
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
