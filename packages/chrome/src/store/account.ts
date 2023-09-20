import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import { nanoid } from "nanoid";
import { WalletType } from "./account.d";



export const account = createModel<RootModel>()({
  name: "account",
  state: {
    [WalletType.HD]: [],
    [WalletType.SIMPLE]: [],
  },
  reducers: {

  },
  effects: (dispatch) => ({
    async createNewHDWallet(state, payload: { wallet: { walletName: string } }) {
      const walletId = nanoid();
    }

  }),
});
