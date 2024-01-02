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
import { unionBy } from "lodash";

type SelectedAccount = DisplayAccount & {
  walletId: string;
  coinType: CoinType;
};

type WalletBackupedMnemonicMap = { [walletId in string]: boolean };

type WalletInfoMap = { [walletId in string]: DisplayWallet };

interface AccountModel {
  selectedAccount: SelectedAccount;
  selectedUniqueId: ChainUniqueId;
  walletBackupMnemonicMap: WalletBackupedMnemonicMap;
  allWalletInfo: WalletInfoMap;
}

const DEFAULT_ACCOUNT_MODEL: AccountModel = {
  selectedAccount: {
    accountId: "",
    accountName: "",
    address: "",
    index: 0,
    walletId: "",
    coinType: CoinType.ALEO,
    hide: false,
  },
  selectedUniqueId: DEFAULT_UNIQUE_ID_MAP[CoinType.ALEO],
  walletBackupMnemonicMap: {},
  allWalletInfo: {},
};

export const account = createModel<RootModel>()({
  name: "account",
  state: {
    ...DEFAULT_ACCOUNT_MODEL,
  },
  reducers: {
    _setSelectedAccount(state, payload: { selectedAccount: SelectedAccount }) {
      let { selectedAccount } = payload;
      const walletInStore = state.allWalletInfo[selectedAccount.walletId];

      if (walletInStore) {
        const accountInStore = (
          walletInStore.accountsMap?.[CoinType.ALEO] || []
        ).find((a) => a.accountId === selectedAccount.accountId);
        /**
         * need to match accountName in allWalletInfo because we only store
         * the properties unrelated to UI on the IndexedDB
         */
        if (accountInStore) {
          selectedAccount = {
            ...selectedAccount,
            accountName: accountInStore.accountName,
          };
        }
      }

      return {
        ...state,
        selectedAccount,
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
    _setAllWalletInfo(state, payload: { walletList: DisplayWallet[] }) {
      const { walletList } = payload;
      const oldAllWalletInfo = { ...state.allWalletInfo };
      const oldAllWalletIds = Object.keys(oldAllWalletInfo);

      const allWalletInfo: WalletInfoMap = {};

      walletList.map((w) => {
        const { mnemonic, ...restInfo } = w;

        if (oldAllWalletIds.includes(w.walletId)) {
          const oldAccountMap = oldAllWalletInfo[w.walletId].accountsMap || {};
          const oldAccountList = oldAccountMap[CoinType.ALEO] || [];
          const newAccountList = unionBy(
            [...oldAccountList, ...(w.accountsMap[CoinType.ALEO] || [])],
            "accountId",
          ).sort((a1, a2) => a1.index - a2.index);

          allWalletInfo[w.walletId] = {
            ...restInfo,
            // make sure using walletName & accountName in Redux store
            walletName: oldAllWalletInfo[w.walletId].walletName || "",
            accountsMap: {
              ...w.accountsMap,
              [CoinType.ALEO]: newAccountList,
            },
          };
        } else {
          allWalletInfo[w.walletId] = restInfo;
        }
      });

      return {
        ...state,
        allWalletInfo,
      };
    },
    changeWalletName(state, payload: { walletId: string; walletName: string }) {
      const { walletId, walletName } = payload;
      const oldWallet = state.allWalletInfo[walletId];
      return {
        ...state,
        allWalletInfo: {
          ...state.allWalletInfo,
          [walletId]: {
            ...oldWallet,
            walletName,
          },
        },
      };
    },
    changeAccountName(
      state,
      paylaod: { walletId: string; accountId: string; accountName: string },
    ) {
      const { walletId, accountId, accountName } = paylaod;
      const oldWallet = state.allWalletInfo[walletId];
      const oldAccountList: DisplayAccount[] =
        oldWallet.accountsMap[CoinType.ALEO] || [];

      const newAccountList = oldAccountList.map((account) => {
        if (account.accountId === accountId) {
          return {
            ...account,
            accountName,
          };
        }
        return account;
      });

      const newWallet: DisplayWallet = {
        ...oldWallet,
        accountsMap: {
          ...oldWallet.accountsMap,
          [CoinType.ALEO]: newAccountList,
        },
      };

      return {
        ...state,
        allWalletInfo: {
          ...state.allWalletInfo,
          [walletId]: {
            ...newWallet,
          },
        },
      };
    },
    changeAccountHideState(
      state,
      payload: {
        walletId: string;
        accountId: string;
        coinType: CoinType;
        hide: boolean;
      },
    ) {
      const { walletId, accountId, coinType, hide } = payload;
      const matchedWallet = state.allWalletInfo[walletId];
      if (matchedWallet) {
        const accountList = matchedWallet.accountsMap[coinType] || [];
        const targetAccountIndex = accountList.findIndex(
          (a) => a.accountId === accountId,
        );

        if (targetAccountIndex !== -1) {
          accountList[targetAccountIndex] = {
            ...accountList[targetAccountIndex],
            hide: !!hide,
          };
          const walletInfo = {
            ...matchedWallet,
            accountsMap: {
              ...matchedWallet.accountsMap,
              [coinType]: [...accountList],
            },
          };
          console.log("change account state ", !!hide);
          return {
            ...state,
            allWalletInfo: {
              ...state.allWalletInfo,
              [walletId]: { ...walletInfo },
            },
          };
        }
      }

      return state;
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

    async resyncAllWalletsToStore() {
      const wallets = await clients.popupServerClient.getAllWallet();
      if (!wallets) return;

      const hdWallets = wallets[WalletType.HD] ?? [];
      const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
      const walletList = [...hdWallets, ...simpleWallets];
      dispatch.account._setAllWalletInfo({ walletList });
    },

    async deleteWallet(walletId: string) {
      await clients.popupServerClient.deleteHDWallet(walletId);
      dispatch.account.resyncAllWalletsToStore();
    },
  }),
});
