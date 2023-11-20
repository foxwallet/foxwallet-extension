import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import { nanoid } from "nanoid";
import {
  type DisplayKeyring,
  WalletType,
} from "../scripts/background/store/vault/types/keyring";

export const account = createModel<RootModel>()({
  name: "account",
  state: {
    [WalletType.HD]: [],
    [WalletType.SIMPLE]: [],
  } as DisplayKeyring,
  reducers: {
    init(state, payload: { keyring: DisplayKeyring }) {
      const { keyring } = payload;
      return {
        ...state,
        ...keyring,
      };
    },
  },
  effects: (dispatch) => ({}),
});
