import { useClient } from "./useClient";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { CoinType } from "core/types";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useCoinBasic } from "./useCoinService";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import { showDeleteWalletWarningDialog } from "@/components/Wallet/DeleteWalletWarningDialog";
import { useNavigate } from "react-router-dom";

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

  const key = `/wallets`;
  const fetchWallets = useCallback(async () => {
    dispatch.account.resyncAllWalletsToStore();
    return await popupServerClient.getAllWallet();
  }, [popupServerClient, dispatch.account]);

  const {
    data: originWallets,
    error,
    mutate: getWallets,
    isLoading: loadingWallets,
  } = useSWR(key, fetchWallets);

  const flattenWalletList = useMemo(() => {
    if (!originWallets) {
      return [];
    }

    const hdWallets = originWallets[WalletType.HD] ?? [];
    const simpleWallets = originWallets[WalletType.SIMPLE] ?? [];
    const allWallets = [...hdWallets, ...simpleWallets];
    return allWallets
      .map((w) => ({
        ...w,
        ...(allWalletInfo[w.walletId] || {}),
      }))
      .filter((w) => !!allWalletInfo[w.walletId]); // must fliter wallets not in allWalletInfo (has been deleted)
  }, [originWallets, allWalletInfo]);

  const addAccount = useCallback(
    async (walletId: string, coinType: CoinType, accountId: string) => {
      try {
        await popupServerClient.addAccount({
          walletId,
          coinType,
          accountId,
        });
        dispatch.account.resyncAllWalletsToStore();
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

      // if there is more than 1 wallet
      if (flattenWalletList.length > 1) {
        await dispatch.account.deleteWallet(walletId);

        if (selectedAccount.walletId !== walletId) {
          return Promise.resolve();
        }

        const nextWallet = flattenWalletList[0];
        const nextAccount = (nextWallet.accountsMap[CoinType.ALEO] || []).find(
          (account) => !account.hide,
        );
        if (!nextAccount) {
          throw new Error("Wallet doesn't has any accounts");
        }

        dispatch.account.setSelectedAccount({
          selectedAccount: {
            ...nextAccount,
            walletId: nextWallet.walletId,
            coinType: CoinType.ALEO,
          },
        });

        return Promise.resolve();
      } else {
        await dispatch.account.deleteWallet(walletId);
        // clear data & reset to /onboard/home
        dispatch.account.setSelectedAccount({
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
        navigate("/onboard/home");
      }
    },
    [dispatch.account, navigate, flattenWalletList, selectedAccount],
  );

  return {
    originWallets,
    flattenWalletList,
    error,
    getWallets,
    loadingWallets,
    addAccount,
    deleteWallet,
  };
};

export const useCurrWallet = () => {
  const { popupServerClient } = useClient();

  const { selectedAccount, uniqueId, allWalletInfo } = usePopupSelector(
    (state) => ({
      selectedAccount: state.account.selectedAccount,
      uniqueId: state.account.selectedUniqueId,
      allWalletInfo: state.account.allWalletInfo,
    }),
    isEqual,
  );
  const coinBasic = useCoinBasic(uniqueId);

  const selectedWallet = useMemo(
    () => allWalletInfo[selectedAccount.walletId],
    [allWalletInfo, selectedAccount.walletId],
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
