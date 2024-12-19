import { type TokenMetaV2, type TokenV2 } from "./Token";

export type NativeBalanceRes = {
  total: bigint; // for display if availableBalance
  privateBalance?: bigint;
  publicBalance?: bigint;
  availableBalance?: bigint;
};

export type TokenBalanceParams = {
  address: string;
  token: Pick<TokenMetaV2, "contractAddress">;
};

export type BalanceResp = {
  total: bigint;
  publicBalance?: bigint;
  privateBalance?: bigint;
};
