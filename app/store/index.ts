import { type Models } from "@rematch/core";
import { user } from "./user";
import { account } from "./account";
import { accountV2 } from "./accountV2";
import { setting } from "./setting";
import { tokens } from "./token";
import { wallet } from "./wallet";
import { multiChain } from "./multiChain";
import { address } from "@/store/addressModel";
import { coinPriceV2 } from "@/store/coinPriceModelV2";

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  account: typeof account;
  accountV2: typeof accountV2;
  setting: typeof setting;
  tokens: typeof tokens;
  wallet: typeof wallet;
  multiChain: typeof multiChain;
  address: typeof address;
  coinPriceV2: typeof coinPriceV2;
}

export const models: RootModel = {
  user,
  account,
  accountV2,
  setting,
  tokens,
  wallet,
  multiChain,
  address,
  coinPriceV2,
};
