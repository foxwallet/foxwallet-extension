import { Transaction } from "./AleoTransaction";

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
