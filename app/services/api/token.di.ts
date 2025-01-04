import { type BigNumber } from "ethers";

export type TokenItem = {
  symbol: string;
  display: string;
  name: string;
  type: string;
  decimals: number;
  token: string;
  icon: string;
  price: string;
  change?: string;
  security?: string;
};

export type TokenListRes = {
  status: number;
  msg: string;
  data: TokenItem[];
};

export type TokenBalance = {
  value: BigNumber;
  decimals: number;
  // for zksync 1.0
  enableForFee?: boolean;
};
