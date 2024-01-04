import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo } from "react";
import { CoinType } from "core/types";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useCoinBasic } from "./useCoinService";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import { showDeleteWalletWarningDialog } from "@/components/Wallet/DeleteWalletWarningDialog";
import { useNavigate } from "react-router-dom";
import { useCurrAccount } from "./useCurrAccount";

export const useWallets = () => {
  const { popupServerClient } = useClient();
  const navigate = useNavigate();

  const { allWalletInfo, selectedAccount } = usePopupSelector(
    (state) => ({
      allWalletInfo: state.account.allWalletInfo,
      selectedAccount: state.account.selectedAccount,
    }),
    isEqual,
  );
  const dispatch = usePopupDispatch();

  const walletList = useMemo(() => {
    return Object.values(allWalletInfo);
  }, [allWalletInfo]);

  useEffect(() => {
    dispatch.account.resyncAllWalletsToStore();
  }, [dispatch]);

  const addAccount = useCallback(
    async (walletId: string, coinType: CoinType, accountId: string) => {
      try {
        await popupServerClient.addAccount({
          walletId,
          coinType,
          accountId,
        });
        await dispatch.account.resyncAllWalletsToStore();
      } catch (e) {
        console.warn("add account error ", e);
      }
    },
    [popupServerClient, dispatch.account],
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

      const newWallets = await dispatch.account.deleteWallet(walletId);
      return newWallets;
    },
    [dispatch.account, navigate, selectedAccount],
  );

  return {
    walletList,
    addAccount,
    deleteWallet,
  };
};

export const useCurrWallet = () => {
  const { popupServerClient } = useClient();

  const { selectedAccount, uniqueId } = useCurrAccount();

  const { walletList } = useWallets();

  const coinBasic = useCoinBasic(uniqueId);

  const selectedWallet = useMemo(
    () => walletList.find((item) => item.walletId === selectedAccount.walletId),
    [walletList, selectedAccount.walletId],
  );

  const accountsInWallet = useMemo(() => {
    return (selectedWallet?.accountsMap[coinBasic.coinType] || []).filter(
      (a) => !a.hide,
    );
  }, [selectedWallet, coinBasic]);

  const dispatch = usePopupDispatch();

  const changeWalletName = useCallback(
    async (walletId: string, walletName: string) => {
      dispatch.account.changeWalletName({ walletId, walletName });
    },
    [popupServerClient, dispatch.account],
  );

  return {
    selectedWallet,
    accountsInWallet,
    changeWalletName,
  };
};
