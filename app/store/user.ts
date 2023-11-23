import { createModel } from "@rematch/core";
import { type RootModel } from "./index";

export const user = createModel<RootModel>()({
  name: "user",
  state: {
    hasAuth: false,
  },
  reducers: {
    setHasAuth(state, payload: { hasAuth: boolean }) {
      const { hasAuth } = payload;
      return {
        ...state,
        hasAuth,
      };
    },
  },
});
