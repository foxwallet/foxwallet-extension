import { type Models } from "@rematch/core";
import { user } from "./user";
import { account } from "./account";
import { setting } from "./setting";

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  account: typeof account;
  setting: typeof setting;
}

export const models: RootModel = {
  user,
  account,
  setting,
};
