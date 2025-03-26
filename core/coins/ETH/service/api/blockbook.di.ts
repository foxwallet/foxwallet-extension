export type TokenRes = {
  type: string;
  name: string;
  contract: string;
  transfers?: number;
  symbol: string;
  decimals: number;
  balance?: string;
};

export type TransactionTokenRes = {
  address: string;
  balance: string;
  unconfirmedBalance: string;
  unconfirmedTxs: number;
  txs: number;
  nonTokenTxs: number;
  nonce: string;
  tokens: TokenRes[];
};

export type TransactionHistoryRes = {
  page: number;
  totalPages: number;
  itemsOnPage: number;
  address: string;
  balance: string;
  unconfirmedBalance: string;
  unconfirmedTxs: number;
  txs: number;
  nonTokenTxs: number;
  transactions: TransactionRes[];
  tokens?: TokenRes[];
};

export type EthereumSpecific = {
  status: number;
  nonce: number;
  gasLimit: number;
  gasUsed: number;
  gasPrice: string;
  data: string;
};

export type TransactionRes = {
  txid: string;
  vin: Vin[];
  vout: Vout[];
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  blockTime: number;
  value: string;
  fees: string;
  tokenTransfers?: TokenTransfer[];
  ethereumSpecific?: EthereumSpecific;
};

type Vin = {
  n: number;
  addresses: string[];
  isAddress: boolean;
};

type Vout = {
  value: string;
  n: number;
  addresses: string[];
  isAddress: boolean;
};

export type TokenTransfer = {
  type: string;
  from: string;
  to: string;
  token: string; // old
  contract: string; // new
  name: string;
  symbol: string;
  decimals: number;
  value: string;
};
