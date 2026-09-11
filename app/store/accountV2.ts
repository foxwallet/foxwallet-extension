import { isEqual } from "lodash";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  WalletType,
  type DisplayWallet,
  type OneMatchGroupAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  chainUniqueIdToAccountOptions,
  chainUniqueIdToCoinType,
} from "core/helper/CoinType";

type WalletBackupedMnemonicMap = { [walletId in string]: boolean };

type WalletInfoMap = { [walletId in string]: DisplayWallet };

interface AccountModel {
  selectedGroupAccount: OneMatchGroupAccount;
  walletBackupMnemonicMap: WalletBackupedMnemonicMap;
  allWalletInfo: WalletInfoMap;
  showBalance: boolean;
}

export const EMPTY_GROUP_ACCOUNT = {
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

export const accountV2 = createSlice({
  name: "accountV2",
  initialState: {
    ...DEFAULT_ACCOUNT_MODEL,
  },
  reducers: {
    _reset() {
      return {
        ...DEFAULT_ACCOUNT_MODEL,
      };
    },
    _setSelectedGroupAccount(
      state,
      action: PayloadAction<{ groupAccount: OneMatchGroupAccount }>,
    ) {
      const payload = action.payload;
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
      action: PayloadAction<{ walletId: string; backupedMnemonic: boolean }>,
    ) {
      const payload = action.payload;
      const { walletId, backupedMnemonic } = payload;
      return {
        ...state,
        walletBackupMnemonicMap: {
          ...state.walletBackupMnemonicMap,
          [walletId]: backupedMnemonic,
        },
      };
    },
    _setAllWalletInfo(
      state,
      action: PayloadAction<{ walletList: DisplayWallet[] }>,
    ) {
      const payload = action.payload;
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
    changeWalletName(
      state,
      action: PayloadAction<{ walletId: string; walletName: string }>,
    ) {
      const payload = action.payload;
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
      action: PayloadAction<{
        walletId: string;
        groupId: string;
        accountName: string;
      }>,
    ) {
      const paylaod = action.payload;
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
});

export const matchAccountsWithUniqueId = (
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
