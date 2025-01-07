import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import {
  WalletType,
  type DisplayWallet,
  type OneMatchGroupAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { CoinType } from "core/types";
import { getClients } from "@/hooks/useClient";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  chainUniqueIdToAccountOptions,
  chainUniqueIdToCoinType,
} from "core/helper/CoinType";
import { isEqual } from "lodash";
import { type RootState } from "@/store/store";

type WalletBackupedMnemonicMap = { [walletId in string]: boolean };

type WalletInfoMap = { [walletId in string]: DisplayWallet };

interface AccountModel {
  selectedGroupAccount: OneMatchGroupAccount;
  walletBackupMnemonicMap: WalletBackupedMnemonicMap;
  allWalletInfo: WalletInfoMap;
  showBalance: boolean;
}

const EMPTY_GROUP_ACCOUNT = {
  wallet: {
    walletId: "",
    walletName: "",
    walletType: WalletType.HD,
  },
  group: {
    groupId: "",
    groupName: "",
    index: 0,
    accounts: [],
  },
};

const DEFAULT_ACCOUNT_MODEL: AccountModel = {
  selectedGroupAccount: EMPTY_GROUP_ACCOUNT,
  walletBackupMnemonicMap: {},
  allWalletInfo: {},
  showBalance: true,
};

export const accountV2 = createModel<RootModel>()({
  name: "accountV2",
  state: {
    ...DEFAULT_ACCOUNT_MODEL,
  },
  reducers: {
    _setSelectedGroupAccount(
      state,
      payload: { groupAccount: OneMatchGroupAccount },
    ) {
      let { groupAccount } = payload;
      const walletInStore = state.allWalletInfo[groupAccount.wallet.walletId];
      if (walletInStore) {
        const groupAccountInStore = walletInStore.groupAccounts.find(
          (item) => item.groupId === groupAccount.group.groupId,
        );
        /**
         * need to match accountName in allWalletInfo because we only store
         * the properties unrelated to UI on the IndexedDB
         */
        if (groupAccountInStore) {
          groupAccount = {
            wallet: groupAccount.wallet,
            group: {
              ...groupAccountInStore,
              groupName: groupAccountInStore.groupName,
            },
          };
        }
      }

      return {
        ...state,
        selectedGroupAccount: groupAccount,
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

      walletList.forEach((wallet) => {
        const { mnemonic, ...restInfo } = wallet;

        if (oldAllWalletIds.includes(wallet.walletId)) {
          const oldGroupAccountList =
            oldAllWalletInfo[wallet.walletId].groupAccounts || [];

          const newGroupAccountList = [...(wallet.groupAccounts || [])].map(
            (account) => {
              const matchedAccount = oldGroupAccountList.find(
                (oldAccount) => oldAccount.groupId === account.groupId,
              );
              if (matchedAccount) {
                return {
                  ...account,
                  groupName: matchedAccount.groupName,
                };
              }
              return account;
            },
          );

          allWalletInfo[wallet.walletId] = {
            ...restInfo,
            // make sure using walletName in Redux store
            walletName: oldAllWalletInfo[wallet.walletId].walletName || "",
            groupAccounts: newGroupAccountList,
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
      paylaod: { walletId: string; groupId: string; accountName: string },
    ) {
      const { walletId, groupId, accountName } = paylaod;
      const oldWallet = state.allWalletInfo[walletId];
      const oldAccountList = oldWallet.groupAccounts || [];

      const newAccountList = oldAccountList.map((account) => {
        if (account.groupId === groupId) {
          return {
            ...account,
            groupName: accountName,
          };
        }
        return account;
      });

      const newWallet: DisplayWallet = {
        ...oldWallet,
        groupAccounts: newAccountList,
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
    async setSelectedGroupAccount({
      selectedGroupAccount,
    }: {
      selectedGroupAccount: OneMatchGroupAccount;
    }) {
      const clients = getClients();
      await clients.popupServerClient.setSelectedGroupAccount({
        groupAccount: selectedGroupAccount,
      });
      dispatch.accountV2._setSelectedGroupAccount({
        groupAccount: selectedGroupAccount,
      });
    },
    async getSelectedGroupAccount() {
      const clients = getClients();
      const [groupAccount] = await Promise.all([
        clients.popupServerClient.getSelectedGroupAccount(),
      ]);
      if (groupAccount) {
        dispatch.accountV2._setSelectedGroupAccount({
          groupAccount,
        });
      } else {
        dispatch.accountV2._setSelectedGroupAccount({
          groupAccount: EMPTY_GROUP_ACCOUNT,
        });
      }
      return { groupAccount };
    },
    async resyncAllWalletsToStore() {
      try {
        const clients = getClients();
        const [wallets, selectedGroupAccount] = await Promise.all([
          clients.popupServerClient.getAllWallet(),
          clients.popupServerClient.getSelectedGroupAccount(),
        ]);
        console.log("resyncAllWalletsToStore", wallets);
        console.log("resyncAllWalletsToStore", selectedGroupAccount);
        if (!wallets) return;
        const hdWallets = wallets[WalletType.HD] ?? [];
        const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
        const walletList = [...hdWallets, ...simpleWallets];
        dispatch.accountV2._setAllWalletInfo({ walletList });

        if (!selectedGroupAccount) return;
        console.log("resyncAllWalletsToStore===", selectedGroupAccount);
        dispatch.accountV2._setSelectedGroupAccount({
          groupAccount: selectedGroupAccount,
        });
        return walletList;
      } catch (err) {
        console.error("resyncAllWalletsToStore failed: ", err);
        return [];
      }
    },
    async deleteWallet(walletId: string) {
      const clients = getClients();
      const wallets = await clients.popupServerClient.deleteWallet(walletId);
      if (!wallets) return [];
      // update selectedAccount in Redux store immediately
      await dispatch.accountV2.getSelectedGroupAccount();
      const hdWallets = wallets[WalletType.HD] ?? [];
      const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
      const walletList = [...hdWallets, ...simpleWallets];
      dispatch.accountV2._setAllWalletInfo({ walletList });
      return [...walletList];
    },
  }),
});

export const matchAccountsWithUnqiueId = (
  groupAccount: OneMatchGroupAccount,
  uniqueId: ChainUniqueId,
) => {
  const coinType = chainUniqueIdToCoinType(uniqueId);
  const options = chainUniqueIdToAccountOptions(
    uniqueId,
    groupAccount.wallet.walletType,
  );
  return groupAccount.group.accounts.filter(
    (account) =>
      account.coinType === coinType &&
      options.some((option) => isEqual(option, account.option)),
  );
};
