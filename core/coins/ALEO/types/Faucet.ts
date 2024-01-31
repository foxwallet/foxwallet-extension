export enum FaucetStatus {
  EMPTY = "EMPTY",
  PENDING = "PENDING",
  DONE = "DONE",
}

export interface FaucetResp {
  status: FaucetStatus;
  txId?: string;
}

export interface FaucetMessage {
  rawMessage: string;
  displayMessage: string;
}
