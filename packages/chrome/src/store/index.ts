import { Models } from "@rematch/core";
import { account } from "./account";

export interface RootModel extends Models<RootModel> {
  account: typeof account;
}

export const models: RootModel = {
  account,
};
