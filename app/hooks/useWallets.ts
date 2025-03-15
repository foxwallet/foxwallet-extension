import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import { showDeleteWalletWarningDialog } from "@/components/Wallet/DeleteWalletWarningDialog";
import { useGroupAccount } from "./useGroupAccount";
import { type OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";
import sleep from "sleep-promise";

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
    void dispatch.accountV2.resyncAllWalletsToStore();
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
        return Promise.reject(new Error("Password verify failed!"));
      }

      const { confirmed } = await showDeleteWalletWarningDialog();
      if (!confirmed) {
        return Promise.reject(new Error("Cancel deleting!"));
      }

      const newWallets = await dispatch.accountV2.deleteWallet(walletId);
      return newWallets;
    },
    [dispatch.accountV2],
  );

  const deleteAllWallets = useCallback(async () => {
    let resWallet = walletList;
    while (resWallet.length > 0) {
      console.log("      resWallet.length", resWallet.length);
      resWallet = await dispatch.accountV2.deleteWallet(resWallet[0].walletId);
      await sleep(100);
    }
  }, [dispatch.accountV2, walletList]);

  const resetWallet = useCallback(async () => {
    return await dispatch.accountV2.resetWallet();
  }, [dispatch.accountV2]);

  return {
    walletList,
    addAccount,
    deleteWallet,
    deleteAllWallets,
    resetWallet,
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
    [dispatch.accountV2],
  );

  return {
    selectedWallet,
    groupAccountsInWallet,
    changeWalletName,
  };
};
