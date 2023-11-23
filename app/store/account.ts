import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import type { DisplayAccount } from "@/scripts/background/store/vault/types/keyring";
import { CoinType } from "core/types";

type SelectedAccount = DisplayAccount & {
  walletId: string;
  coinType: CoinType;
};

interface AccountModel {
  selectedAccount: SelectedAccount;
}

const DEFAULT_ACCOUNT_MODEL: AccountModel = {
  selectedAccount: {
    accountId: "",
    accountName: "",
    address: "",
    index: 0,
    walletId: "",
    coinType: CoinType.ALEO,
  },
};

export const account = createModel<RootModel>()({
  name: "account",
  state: {
    ...DEFAULT_ACCOUNT_MODEL,
  },
  reducers: {
    setSelectedAccount(state, payload: { selectedAccount: SelectedAccount }) {
      return {
        ...state,
        selectedAccount: payload.selectedAccount,
      };
    },
  },
  effects: (dispatch) => ({}),
});
