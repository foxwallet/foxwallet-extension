import { FaucetStatus } from "../../types/Faucet";
import { SyncResp } from "./sync.di";

export type AleoFaucetContentResp = SyncResp<Record<string, string>>;

export type AleoRequestFaucetResp = SyncResp<string>;

export type AleoFaucetStatusResp = SyncResp<{
  status: FaucetStatus;
  txid?: string;
}>;
