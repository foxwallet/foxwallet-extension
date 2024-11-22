import { type TransactionStatus } from "core/types/TransactionStatus";
import { type GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types/CoinType";
import { type ethers } from "ethers";
import { type TxHistoryPaginationParam } from "core/types/Pagination";
import { type TransactionResponse } from "@ethersproject/abstract-provider";

export type FilSpecificTxParam = {
  method?: number;
  params?: string;
  version?: number;
  oldTxId?: string;
};

export type ChainSpecificReturn<T extends CoinType> = T extends CoinType.ETH
  ? {
      wait?: TransactionResponse["wait"];
    }
  : T extends CoinType.ALEO
  ? {
      // aleoTxParams?: AleoTxParams;
    }
  : // : T extends CoinType.QTUM
    // ? {
    //     qrc20TokenTransfers?: QRC20Transfer[];
    //   }
    undefined;

export enum TxLabel {
  // SEND = "send",
  // RECEIVE = "receive",
  // Label 应该是无状态的，和地址无关的，只表明该交易的类型，故删掉 SEND 和 RECEIVE
  CONTRACT_CALL = "contract_call",
  CONTRACT_CREATE = "contract_create",
  GAS_REFUND = "gas_refund",
  SPAWN = "spawn",
  INSCRIBE = "inscribe",
  TOKEN_TRANSFER = "token_transfer",
  TOKEN_APPROVE = "token_approve",
  SWAP = "swap",
  BRDIGE = "bridge",
  STAKE = "stake",
  UNSTAKE = "unstake",
  WITHDRAW = "withdraw",
  ISSUE = "issue",
  MINT = "mint",
  BURN = "burn",
  FREEZE = "freeze",
  UNFREEZE = "unfreeze",
  GLOBAL_FREEZE = "global_freeze",
  GLOBAL_UNFREEZE = "global_unfreeze",
  WHITELIST_LIMIT = "whitelist_limit",
  ADD_WHITELIST = "add_to_whitelist",
  DE_WHITELIST = "remove_from_whitelist",
}

export type TransactionHistoryItem = {
  id: string;
  from: string;
  to: string;
  value: bigint;
  timestamp: number;
  status: TransactionStatus;
  height: number; // use SpecificHeightValue for unconfirmed and others

  label?: TxLabel;
  nonce?: number;
  fees?: bigint; // 总手续费
  gasFee?: GasFee<CoinType>; // 详细手续费参数
  data?: string;
  filSpecific?: FilSpecificTxParam;
  chainSpecificReturn?: ChainSpecificReturn<CoinType>;
  memo?: string;
  inMessageId?: string;
};

export type TransactionHistoryResp = {
  txs: TransactionHistoryItem[];
  pagination: TxHistoryPaginationParam & {
    endReach: boolean;
    totalPage?: number;
    totalCount?: number;
  };
};
