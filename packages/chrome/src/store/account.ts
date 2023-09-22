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
    async getAllWallet() {
      const allWallet = await clients.popupServerClient.getAllWallet();
      dispatch.account.init({ keyring: allWallet });
    },

    async createNewWallet(payload: { walletName: string, revealMnemonic: boolean }) {
      const { walletName, revealMnemonic } = payload;
      await clients.popupServerClient.createWallet({ walletName, revealMnemonic });
      const allWallet = await clients.popupServerClient.getAllWallet();
      dispatch.account.init({ keyring: allWallet });
    },

    async importHDWallet(payload: { walletName: string, mnemonic: string }) {
      const { walletName, mnemonic } = payload;
      await clients.popupServerClient.importHDWallet({ walletName, mnemonic });
      const allWallet = await clients.popupServerClient.getAllWallet();
      dispatch.account.init({ keyring: allWallet });
    },

    async addNewAccount(payload: { walletId: string, coinType: CoinType }) {
      const { walletId, coinType } = payload;
      await clients.popupServerClient.addAccount({ walletId, coin: coinType });
      const allWallet = await clients.popupServerClient.getAllWallet();
      dispatch.account.init({ keyring: allWallet });
    }
  }),
});
