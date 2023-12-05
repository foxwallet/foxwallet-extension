export interface AleoDeployment {
  address: string;
  chainId: string;
  program: string;
  fee: number;
  feePrivate: boolean;
}
