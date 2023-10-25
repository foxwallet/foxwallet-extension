import { createModel } from "@rematch/core";
import { type RootModel } from "./index";

export const user = createModel<RootModel>()({
  name: "user",
  state: {
    hasWallet: false,
  },
  reducers: {
    setHasWallet(state, payload: { hasWallet: boolean }) {
      const { hasWallet } = payload;
      return {
        ...state,
        hasWallet,
      };
    },
  },
});
