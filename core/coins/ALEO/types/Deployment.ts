export interface AleoDeployment {
  address: string;
  chainId: string;
  program: string;
  fee: number;
  feePrivate: boolean;
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

export interface AleoDeploymentInTx {
  edition: number;
  program: string;
  verifying_keys: [[string, [string]]];
}
