import { createModel } from "@rematch/core";
import { RootModel } from "./index";

export const app = createModel<RootModel>()({
  name: "app",
  state: {
    inited: false,
  },
  reducers: {
    setInited(state, payload: { inited: boolean }) {
      const { inited } = payload;
      return {
        ...state,
        inited,
      };
    },
  },
});
