import { type TokenMetaV2, type TokenV2 } from "./Token";

export type NativeBalanceRes = {
  total: bigint; // for display if availableBalance
  privateBalance?: bigint;
  publicBalance?: bigint;
  availableBalance?: bigint;
};

export type TokenBalanceParams = {
  address: string;
  token: TokenMetaV2;
};

export type TokenBalanceRes = TokenV2 & {
  total: bigint;
  publicBalance?: bigint;
  privateBalance?: bigint;
};
