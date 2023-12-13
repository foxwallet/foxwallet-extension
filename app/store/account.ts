import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import type { DisplayAccount } from "@/scripts/background/store/vault/types/keyring";
import { CoinType } from "core/types";
import { clients } from "@/hooks/useClient";
import { DEFAULT_UNIQUE_ID_MAP } from "core/constants";

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
    _setSelectedAccount(state, payload: { selectedAccount: SelectedAccount }) {
      return {
        ...state,
        selectedAccount: payload.selectedAccount,
      };
    },
  },
  effects: (dispatch) => ({
    async setSelectedAccount({
      selectedAccount,
    }: {
      selectedAccount: SelectedAccount;
    }) {
      await clients.popupServerClient.setSelectedAccount({
        selectAccount: selectedAccount,
      });
      const uniqueId = DEFAULT_UNIQUE_ID_MAP[selectedAccount.coinType];
      await clients.popupServerClient.setSelectedUniqueId({
        uniqueId,
      });
      dispatch.account._setSelectedAccount({
        selectedAccount: selectedAccount,
      });
    },

    async getSelectedAccount(coinType: CoinType) {
      const account = await clients.popupServerClient.getSelectedAccount({
        coinType,
      });
      if (account) {
        dispatch.account._setSelectedAccount({
          selectedAccount: account,
        });
        return account;
      }
      return account;
    },
  }),
});
