export type BlockApiResult<T> =
  | {
      message: string;
      status: "1";
      result: T;
    }
  | {
      message: string;
      status: "0";
      result: string;
    };

export type Transaction = {
  nonce: string; // bn
  from: string;
  to: string;
  blockHash: string;
  hash: string;
  blockNumber: string; // bn
  confirmations: string; // bn
  timeStamp: string; // num 1671053471
  value: string; // bn
  gasPrice: string; // bn
  cumulativeGasUsed: string; // bn
  gasUsed: string; // bn
  gas: string; // bn
  txreceipt_status: string; // boolean
  isError: string; // boolean
  input: string;
};

export type TransactionInfo = {
  from: string;
  to: string;
  hash: string;
  blockNumber: string;
  confirmations: string;
  timeStamp: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
};
export type TokenTransfer = {
  blockHash: string;
  input: string;
  from: string;
  to: string;
  contractAddress: string;
  hash: string;
  nonce: string;
  blockNumber: string;
  confirmations: string;
  timeStamp: string;
  value: string;
  cumulativeGasUsed: string;
  gasPrice: string;
  gasUsed: string;
  gas: string;
  tokenDecimal: string;
};

export type TokenBalance = {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
};
