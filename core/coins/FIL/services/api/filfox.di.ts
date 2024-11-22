export type TransactionReceipt = {
  exitCode: number;
  return?: string;
  gasUsed?: number;
};

export type UnconfirmedTransactionRes = {
  totalCount: number;
  messages: UnconfirmedTransactionResMsg[];
};

export type UnconfirmedTransactionResMsg = {
  cid: string;
  from: string;
  to: string;
  nonce: number;
  value: string;
  gasLimit: number;
  gasFeeCap: string;
  gasPremium: string;
  method: string;
  methodNumber: number;
  createTimestamp: number;
};

export type TransferHistoryItem = {
  message: string;
  height: number;
  timestamp: number;
  value: string;
};

export type TransferHistoryRes = {
  totalCount: number;
  transfers: TransferHistoryItem[];
};

export type Receipt = {
  exitCode: number;
};

export type MessageHistoryItem = {
  cid: string;
  height: number;
  timestamp: number;
  from: string;
  to: string;
  nonce: number;
  value: string;
  method: string;
  receipt: Receipt;
};

export type MessageHistoryRes = {
  totalCount: number;
  messages: MessageHistoryItem[];
};

export type TransactionRes = {
  cid: string;
  version: number;
  from: string;
  to: string;
  nonce: number;
  value: string;
  gasLimit: number;
  gasFeeCap: string;
  gasPremium: string;
  method: string;
  methodNumber: number;
  params: string;
  height: number;
  timestamp: number;
  confirmations: number;
  baseFee: string;
  fee: TransactionFee;
  receipt: TransactionReceipt;
  replaced?: boolean;
  oldCid?: string;
};

export type TokenHistoryItem = {
  height: number;
  timestamp: number;
  message: string;
  from: string;
  to: string;
  value: string;
};

export type TokenHistoryRes = {
  totalCount: number;
  transfers: TokenHistoryItem[];
};

export type ERC20 = {
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress: string;
  balance: string;
};

export type TokenHoldingsRes = {
  ercTwentyList: {
    tokenCount: number;
    tokenList: ERC20[];
  };
};

type TransactionFee = {
  baseFeeBurn: string;
  overEstimationBurn: string;
  minerPenalty: string;
  minerTip: string;
  refund: string;
};
