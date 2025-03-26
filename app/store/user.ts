import { createModel } from "@rematch/core";
import { type RootModel } from "./index";

export const user = createModel<RootModel>()({
  name: "user",
  state: {
    hasAuth: false,
  },
  reducers: {
    _reset() {
      return { hasAuth: false };
    },
    setHasAuth(state, payload: { hasAuth: boolean }) {
      const { hasAuth } = payload;
      return {
        ...state,
        hasAuth,
      };
    },
  },
});
