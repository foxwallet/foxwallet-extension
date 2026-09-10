import { combineReducers } from "@reduxjs/toolkit";
import { user } from "./user";
import { account } from "./account";
import { accountV2 } from "./accountV2";
import { setting } from "./setting";
import { tokens } from "./token";
import { wallet } from "./wallet";
import { multiChain } from "./multiChain";
import { address } from "./addressModel";
import { coinPriceV2 } from "./coinPriceModelV2";
import { coinBalanceV2 } from "./coinBalanceModelV2";

export const slices = {
  user,
  account,
  accountV2,
  setting,
  tokens,
  wallet,
  multiChain,
  address,
  coinPriceV2,
  coinBalanceV2,
};
export const rootReducer = combineReducers({
  user: user.reducer,
  account: account.reducer,
  accountV2: accountV2.reducer,
  setting: setting.reducer,
  tokens: tokens.reducer,
  wallet: wallet.reducer,
  multiChain: multiChain.reducer,
  address: address.reducer,
  coinPriceV2: coinPriceV2.reducer,
  coinBalanceV2: coinBalanceV2.reducer,
});
export type RootState = ReturnType<typeof rootReducer>;
export const actionTypes = new Set(
  Object.values(slices).flatMap((slice) =>
    Object.values(slice.actions).map((action) => action.type),
  ),
);
