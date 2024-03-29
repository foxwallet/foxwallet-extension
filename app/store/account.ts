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
import { ChangeAccountStateProps } from "@/scripts/background/servers/IWalletServer";

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
  showBalance: boolean;
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
  showBalance: true,
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

      walletList.map((wallet) => {
        const { mnemonic, ...restInfo } = wallet;

        if (oldAllWalletIds.includes(wallet.walletId)) {
          const oldAccountList =
            oldAllWalletInfo[wallet.walletId].accountsMap[CoinType.ALEO] || [];

          const newAccountList = [
            ...(wallet.accountsMap[CoinType.ALEO] || []),
          ].map((account) => {
            const matchedAccount = oldAccountList.find(
              (oldAccount) => oldAccount.accountId === account.accountId,
            );
            if (matchedAccount) {
              return {
                ...account,
                ...matchedAccount, // using accountName of the existed account in Redux store
                hide: account.hide,
              };
            }
            return account;
          });

          allWalletInfo[wallet.walletId] = {
            ...restInfo,
            // make sure using walletName in Redux store
            walletName: oldAllWalletInfo[wallet.walletId].walletName || "",
            accountsMap: {
              ...wallet.accountsMap,
              [CoinType.ALEO]: newAccountList,
            },
          };
        } else {
          allWalletInfo[wallet.walletId] = restInfo;
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
    changeBalanceState(state) {
      return {
        ...state,
        showBalance: !state.showBalance,
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
      } else {
        dispatch.account._setSelectedAccount({
          selectedAccount: {
            accountId: "",
            accountName: "",
            address: "",
            index: 0,
            walletId: "",
            coinType: CoinType.ALEO,
            hide: false,
          },
        });
      }
      return { account, uniqueId };
    },

    async resyncAllWalletsToStore() {
      try {
        const [wallets] = await Promise.all([
          clients.popupServerClient.getAllWallet(),
          this.getSelectedAccount(CoinType.ALEO),
        ]);
        if (!wallets) return;

        const hdWallets = wallets[WalletType.HD] ?? [];
        const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
        const walletList = [...hdWallets, ...simpleWallets];
        dispatch.account._setAllWalletInfo({ walletList });
        return walletList;
      } catch (err) {
        console.error("resyncAllWalletsToStore failed: ", err);
        return [];
      }
    },

    async deleteWallet(walletId: string) {
      const wallets = await clients.popupServerClient.deleteWallet(walletId);
      if (!wallets) return [];
      // update selectedAccount in Redux store immediately
      await dispatch.account.getSelectedAccount(CoinType.ALEO);

      const hdWallets = wallets[WalletType.HD] ?? [];
      const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
      const walletList = [...hdWallets, ...simpleWallets];
      dispatch.account._setAllWalletInfo({ walletList: walletList });

      return [...walletList];
    },

    async changeAccountHideState(params: ChangeAccountStateProps) {
      await clients.popupServerClient.changeAccountHideState(params);
      await dispatch.account.resyncAllWalletsToStore();
    },
  }),
});
