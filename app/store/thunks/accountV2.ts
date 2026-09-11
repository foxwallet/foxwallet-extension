import { isEqual } from "lodash";
import {
  WalletType,
  type DisplayWallet,
  type OneMatchGroupAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { getClients } from "@/hooks/useClient";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  chainUniqueIdToAccountOptions,
  chainUniqueIdToCoinType,
} from "core/helper/CoinType";
import { actions } from "../actions";
import type { AppThunk } from "../types";
import { EMPTY_GROUP_ACCOUNT } from "../accountV2";

export const accountV2Thunks = {
  setSelectedGroupAccount({
    selectedGroupAccount,
  }: {
    selectedGroupAccount: OneMatchGroupAccount;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const clients = getClients();
      await clients.popupServerClient.setSelectedGroupAccount({
        groupAccount: selectedGroupAccount,
      });
      await dispatch(
        actions.accountV2._setSelectedGroupAccount({
          groupAccount: selectedGroupAccount,
        }),
      );
    };
  },
  getSelectedGroupAccount(): AppThunk<
    Promise<{ groupAccount: OneMatchGroupAccount | undefined | null }>
  > {
    return async (dispatch, getState) => {
      const clients = getClients();
      const [groupAccount] = await Promise.all([
        clients.popupServerClient.getSelectedGroupAccount(),
      ]);
      if (groupAccount) {
        await dispatch(
          actions.accountV2._setSelectedGroupAccount({
            groupAccount,
          }),
        );
      } else {
        await dispatch(
          actions.accountV2._setSelectedGroupAccount({
            groupAccount: EMPTY_GROUP_ACCOUNT,
          }),
        );
      }
      return { groupAccount };
    };
  },
  resyncAllWalletsToStore(): AppThunk<Promise<DisplayWallet[] | undefined>> {
    return async (dispatch, getState) => {
      try {
        const clients = getClients();
        const [wallets, selectedGroupAccount] = await Promise.all([
          clients.popupServerClient.getAllWallet(),
          clients.popupServerClient.getSelectedGroupAccount(),
        ]);
        if (!wallets) return;
        const hdWallets = wallets[WalletType.HD] ?? [];
        const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
        const walletList = [...hdWallets, ...simpleWallets];
        await dispatch(actions.accountV2._setAllWalletInfo({ walletList }));

        if (!selectedGroupAccount) return;
        await dispatch(
          actions.accountV2._setSelectedGroupAccount({
            groupAccount: selectedGroupAccount,
          }),
        );
        return walletList;
      } catch (err) {
        console.error("resyncAllWalletsToStore failed: ", err);
        return [];
      }
    };
  },
  deleteWallet(walletId: string): AppThunk<Promise<DisplayWallet[]>> {
    return async (dispatch, getState) => {
      const clients = getClients();
      const wallets = await clients.popupServerClient.deleteWallet(walletId);
      if (!wallets) return [];
      // update selectedAccount in Redux store immediately
      await dispatch(actions.accountV2.getSelectedGroupAccount());
      const hdWallets = wallets[WalletType.HD] ?? [];
      const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
      const walletList = [...hdWallets, ...simpleWallets];
      await dispatch(actions.accountV2._setAllWalletInfo({ walletList }));
      return [...walletList];
    };
  },
  resetWallet(): AppThunk<Promise<boolean>> {
    return async (dispatch, getState) => {
      const clients = getClients();
      try {
        await clients.popupServerClient.resetWallet();
        await dispatch(actions.accountV2._reset());
        await dispatch(actions.account._reset());
        await dispatch(actions.address._resetNameTags());
        await dispatch(actions.multiChain._reset());
        await dispatch(actions.tokens._reset());
        await dispatch(actions.user._reset());
        await dispatch(actions.wallet._reset());
        return true;
      } catch (e) {
        return false;
      }
    };
  },
};
