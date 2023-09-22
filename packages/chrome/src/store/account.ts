import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import { nanoid } from "nanoid";
import { DisplayKeyring, WalletType } from "../scripts/background/store/vault/types/keyring";
import { clients } from "../hooks/useClient";
import { CoinType } from "@foxwallet/core/types";

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
      }
    }
  },
  effects: (dispatch) => ({
  }),
});
