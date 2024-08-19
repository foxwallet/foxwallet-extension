import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import { showDeleteWalletWarningDialog } from "@/components/Wallet/DeleteWalletWarningDialog";
import { useGroupAccount } from "./useGroupAccount";
import { OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";

export const useWallets = () => {
  const { popupServerClient } = useClient();

  const { allWalletInfo } = usePopupSelector(
    (state) => ({
      allWalletInfo: state.accountV2.allWalletInfo,
    }),
    isEqual,
  );
  const dispatch = usePopupDispatch();

  const walletList = useMemo(() => {
    return Object.values(allWalletInfo);
  }, [allWalletInfo]);

  useEffect(() => {
    dispatch.accountV2.resyncAllWalletsToStore();
  }, [dispatch]);

  const addAccount = useCallback(
    async (walletId: string, accountId: string) => {
      try {
        await popupServerClient.addAccount({
          walletId,
          accountId,
        });
        await dispatch.accountV2.resyncAllWalletsToStore();
      } catch (e) {
        console.warn("add account error ", e);
      }
    },
    [popupServerClient, dispatch.accountV2],
  );

  const deleteWallet = useCallback(
    async (walletId: string) => {
      const { confirmed: confirmedPass } = await showPasswordVerifyDrawer();
      if (!confirmedPass) {
        return Promise.reject("Password verify failed!");
      }

      const { confirmed } = await showDeleteWalletWarningDialog();
      if (!confirmed) {
        return Promise.reject("Cancel deleting!");
      }

      const newWallets = await dispatch.accountV2.deleteWallet(walletId);
      return newWallets;
    },
    [dispatch.accountV2],
  );

  return {
    walletList,
    addAccount,
    deleteWallet,
  };
};

export const useCurrWallet = () => {
  const { popupServerClient } = useClient();

  const { walletList } = useWallets();

  const { groupAccount } = useGroupAccount();

  const selectedWallet = useMemo(
    () =>
      walletList.find((item) => item.walletId === groupAccount.wallet.walletId),
    [walletList, groupAccount.wallet.walletId],
  );

  const groupAccountsInWallet = useMemo(() => {
    if (!selectedWallet) return [];
    const { groupAccounts, ...restWallet } = selectedWallet;
    return (groupAccounts.map((item) => ({
      wallet: restWallet,
      group: item,
    })) || []) as OneMatchGroupAccount[];
  }, [selectedWallet]);

  const dispatch = usePopupDispatch();

  const changeWalletName = useCallback(
    async (walletId: string, walletName: string) => {
      dispatch.accountV2.changeWalletName({ walletId, walletName });
    },
    [popupServerClient, dispatch.accountV2],
  );

  return {
    selectedWallet,
    groupAccountsInWallet,
    changeWalletName,
  };
};
