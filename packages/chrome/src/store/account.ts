import { createModel } from "@rematch/core";
import { RootModel } from "./index";

export const account = createModel<RootModel>()({
  name: "account",
  state: {},
});
