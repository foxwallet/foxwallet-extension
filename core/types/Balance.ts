export type NativeBalanceRes = {
  total: bigint; // for display if availableBalance
  privateBalance?: bigint;
  publicBalance?: bigint;
  availableBalance?: bigint;
};

// export type TokenBalanceParams = {
//   address: string;
//   token: TokenMetaV2;
// };
//
// export type TokenBalanceRes = TokenV2 & {
//   balance: BigNumber;
//   publicBalance?: BigNumber;
//   privateBalance?: BigNumber;
// };
