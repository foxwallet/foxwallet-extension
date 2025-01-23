export type AddressTag = {
  addressHash?: string;
  displayName?: string;
  label?: string;
};

export type WatchlistName = {
  displayName?: string;
  label?: string;
};

export type AddressParam = {
  hash?: string;
  implementationName?: string;
  name?: string;
  isContract?: boolean;
  privateTags?: AddressTag[];
  watchlistNames?: WatchlistName[];
  publicTags?: AddressTag[];
  isVerified?: boolean;
};

export type DecodedInputParameter = {
  name?: string;
  type?: string;
  value?: string;
};

export type DecodedInput = {
  methodCall?: string;
  methodId?: string;
  parameters?: DecodedInputParameter[];
};

export type Fee = {
  type?: string;
  value?: string;
};

export type TransactionV2 = {
  timestamp?: string;
  fee?: Fee;
  gasLimit?: number;
  block?: number;
  status?: "ok" | "error";
  method?: string;
  confirmations?: number;
  type?: number;
  exchangeRate?: string;
  to?: AddressParam;
  txBurntFee?: string;
  maxFeePerGas?: string;
  result?: string;
  hash: string;
  gasPrice?: string;
  priorityFee?: string;
  baseFeePerGas?: string;
  from?: AddressParam;
  tokenTransfers?: any[]; // 省略
  txTypes?: string[];
  gasUsed?: string;
  createdContract?: AddressParam;
  position?: number;
  nonce?: number;
  hasErrorInInternalTxs?: boolean;
  actions?: any[]; // 省略
  decodedInput?: DecodedInput;
  tokenTransfersOverflow?: boolean;
  rawInput?: string;
  value?: string;
  maxPriorityFeePerGas?: string;
  revertReason?: string;
  confirmationDuration?: number[];
  txTag?: string;
};

export type NextPageParams = {
  blockNumber?: number | "undefined";
  index?: number | "undefined";
  itemsCount?: number;
};

export type TransactionResp = {
  items?: TransactionV2[];
  nextPageParams?: NextPageParams;
  message?: string;
};

export type TransactionReq = {
  address: string;
  filter?: string;
  nextPageParams?: NextPageParams;
};

export type TokenInfo = {
  name?: string;
  decimals: string; // 注意
  symbol: string;
  address: string;
  type?: string;
  holders?: number;
  exchangeRate?: string;
  totalSupply?: string;
  iconUrl?: string;
  circulatingMarketCap?: string;
};

export type TokenBalanceV2 = {
  tokenInstance?: any; // for NFT
  value?: string;
  tokenId?: string;
  token: TokenInfo;
};

export type TokenBalanceResp = {
  items?: TokenBalanceV2[];
  nextPageParams?: NextPageParams;
  message?: string;
};

export type TokenTransferResp = {
  items?: TokenTransferV2[];
  nextPageParams?: NextPageParams;
  message?: string;
};

export type TokenTransferV2 = {
  blockHash?: string;
  from?: AddressParam;
  logIndex?: string;
  method?: string;
  timestamp?: string;
  to?: AddressParam;
  token?: TokenInfo;
  total?: any; // 省略
  txHash?: string;
  type?: string;
  transactionHash?: string;
};
