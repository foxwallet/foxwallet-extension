import { type FaucetStatus } from "../../types/Faucet";
import { type SyncResp } from "./sync.di";

export type AleoFaucetContentResp = SyncResp<Record<string, string>>;

export type AleoRequestFaucetResp = SyncResp<string>;

export type AleoFaucetStatusResp = SyncResp<{
  status: FaucetStatus;
  txid?: string;
}>;

export type AleoBaseFeeResp = SyncResp<string>;

export type AleoPriorityFeeResp = SyncResp<{
  height: number;
  recommend: number;
}>;
