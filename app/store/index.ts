import { type Models } from "@rematch/core";
import { user } from "./user";
import { account } from "./account";

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  account: typeof account;
}

export const models: RootModel = {
  user,
  account,
};
