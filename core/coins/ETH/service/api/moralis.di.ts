/*
Get native transactions by wallet
https://docs.moralis.io/web3-data-api/evm/reference/wallet-api/get-transactions-by-wallet

Get ERC20 token balance by wallet
https://docs.moralis.io/web3-data-api/evm/reference/wallet-api/get-token-balances-by-wallet
*/

import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type NFTStandard } from "core/types/NFT";

export type TransactionHistReq = {
  address: string;
  uniqueId: ChainUniqueId; // 后台会转换
  contractAddress?: string; // token 合约地址，本位币留空
  chain?: string;
  fromBlock?: string;
  toBlock?: string;
  fromDate?: string;
  toDate?: string;
  cursor?: string; // The cursor returned in the previous response (used for getting the next page).
  include?: string; // 不传或传入"internal_transactions"
  limit?: number; // The desired page size of the result
};

export type NativeTransactionItem = {
  hash: string;
  nonce?: number;
  transactionIndex?: string;
  fromAddress?: string;
  fromAddressLabel?: string;
  toAddress?: string;
  toAddressLabel?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  input?: string;
  receiptCumulativeGasUsed?: string;
  receiptGasUsed?: string;
  receiptContractAddress?: string;
  receiptRoot?: string;
  receiptStatus?: string;
  blockTimestamp?: string; // 2021-04-02T10:07:54.000Z
  blockNumber: number;
  blockHash?: string;
  transferIndex?: [number, number];
  internalTransactions?: InternalTransaction[];
};

export type TokenTransactionItem = {
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  fromAddress: string;
  fromAddressLabel?: string;
  toAddress?: string;
  toAddressLabel?: string;
  blockTimestamp?: string; // 2021-04-02T10:07:54.000Z
  blockNumber: number;
  blockHash?: string;
  value?: string;
  possible_spam?: boolean;
};

export type InternalTransaction = {
  transactionHash?: string;
  blockNumber?: string;
  blockHash?: string;
  type?: string;
  from?: string;
  to?: string;
  value?: string;
  gas?: string;
  gasUsd?: string;
  input?: string;
  output?: string;
};

export type NativeTransactionRes = {
  total?: number;
  page?: number;
  pageSize?: number;
  cursor?: string;
  result?: NativeTransactionItem[];
  message?: string;
};

export type TokenTransactionRes = {
  total?: number;
  page?: number;
  pageSize?: number;
  cursor?: string;
  result?: TokenTransactionItem[];
  message?: string;
};

export type UserInteractiveTokensReq = {
  address: string;
  uniqueId: ChainUniqueId;
  chain?: string;
  toBlock?: string;
  tokenAddresses?: [string];
  excludeSpam?: boolean;
};

export type UserInteractiveTokenItem = {
  tokenAddress: string;
  symbol?: string;
  name?: string;
  logo?: string;
  thumbnail?: string;
  decimals?: number;
  balance?: string;
  possibleSpam?: boolean;
};

export type NFTCollectionsReq = {
  address: string;
  uniqueId: ChainUniqueId;
  chain?: string;
  limit?: number;
  tokenCounts: boolean;
  excludeSpam?: boolean;
  cursor?: string;
};

export type NFTCollectionsResp = {
  status: string;
  page?: number;
  cursor?: string;
  pageSize?: number;
  result?: NFTCollectionMoralis[];
};

export type NFTCollectionMoralis = {
  tokenAddress: string;
  contractType: NFTStandard;
  name: string;
  symbol: string;
  possibleSpam?: boolean;
  verifiedCollection?: boolean;
  collectionLogo?: string;
  collectionBannerImage?: string;
  count?: number;
};

export type NFTsByCollectionReq = {
  address: string;
  uniqueId: ChainUniqueId;
  limit?: number;
  excludeSpam?: boolean;
  tokenAddresses: string[];
  cursor?: string;
  mediaItems?: boolean;
};

export type NFTMoralis = {
  tokenAddress: string;
  tokenId: string;
  amount?: string;
  tokenHash: string;
  media?: any;
  possibleSpam?: boolean;
  contractType?: NFTStandard;
  name: string;
  symbol: string;
  tokenUri: string;
  metadata?: string;
  lastTokenUriSync?: string;
  lastMetadataSync?: string;
  verifiedCollection?: boolean;
};

export type NFTsByCollectionResp = {
  status: string;
  page?: number;
  cursor?: string;
  pageSize?: number;
  result?: NFTMoralis[];
};

export type UserInteractiveTokenRes = UserInteractiveTokenItem[];
