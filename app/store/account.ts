import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import {
  WalletType,
  type DisplayAccount,
  DisplayWallet,
} from "@/scripts/background/store/vault/types/keyring";
import { CoinType } from "core/types";
import { clients } from "@/hooks/useClient";
import { DEFAULT_UNIQUE_ID_MAP } from "core/constants";
import { ChainUniqueId } from "core/types/ChainUniqueId";

type SelectedAccount = DisplayAccount & {
  walletId: string;
  coinType: CoinType;
};

type WalletBackupedMnemonicMap = { [walletId in string]: boolean };

interface AccountModel {
  selectedAccount: SelectedAccount;
  selectedUniqueId: ChainUniqueId;
  walletBackupMnemonicMap: WalletBackupedMnemonicMap;
  walletInfo?: DisplayWallet;
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
  selectedUniqueId: DEFAULT_UNIQUE_ID_MAP[CoinType.ALEO],
  walletBackupMnemonicMap: {},
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
    _setSelectedUniqueId(state, payload: { uniqueId: ChainUniqueId }) {
      return {
        ...state,
        selectedUniqueId: payload.uniqueId,
      };
    },
    changeWalletBackupedMnemonic(
      state,
      payload: { walletId: string; backupedMnemonic: boolean },
    ) {
      const { walletId, backupedMnemonic } = payload;
      return {
        ...state,
        walletBackupMnemonicMap: {
          ...state.walletBackupMnemonicMap,
          [walletId]: backupedMnemonic,
        },
      };
    },
    _setCurrWalletInfo(state, payload: { walletInfo: DisplayWallet }) {
      return {
        ...state,
        walletInfo: payload.walletInfo,
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
      dispatch.account._setSelectedAccount({
        selectedAccount: selectedAccount,
      });
    },

    async setSelectedUniqueId({ uniqueId }: { uniqueId: ChainUniqueId }) {
      await clients.popupServerClient.setSelectedUniqueId({
        uniqueId,
      });
      dispatch.account._setSelectedUniqueId({ uniqueId });
      return uniqueId;
    },

    async getSelectedAccount(coinType: CoinType) {
      const [account, uniqueId] = await Promise.all([
        clients.popupServerClient.getSelectedAccount({
          coinType,
        }),
        clients.popupServerClient.getSelectedUniqueId({ coinType }),
      ]);
      if (account) {
        dispatch.account._setSelectedAccount({
          selectedAccount: account,
        });
        return { account, uniqueId };
      }
      return { account, uniqueId };
    },

    async getCurrWalletInfo(walletId: string) {
      const wallets = await clients.popupServerClient.getAllWallet();
      if (!wallets) return;

      const hdWallets = wallets[WalletType.HD] ?? [];
      const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
      const allWallets = [...hdWallets, ...simpleWallets];

      const walletInfo = allWallets.find((w) => w.walletId === walletId);
      if (walletInfo) {
        dispatch.account._setCurrWalletInfo({ walletInfo });
        return walletInfo;
      }
      return walletInfo;
    },
  }),
});
