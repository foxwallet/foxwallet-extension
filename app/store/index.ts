import { type Models } from "@rematch/core";
import { user } from "./user";
import { account } from "./account";
import { setting } from "./setting";
import { tokens } from "./token";

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  account: typeof account;
  setting: typeof setting;
  tokens: typeof tokens;
}

export const models: RootModel = {
  user,
  account,
  setting,
  tokens,
};
