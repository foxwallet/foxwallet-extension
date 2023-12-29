import { useClient } from "./useClient";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { CoinType } from "core/types";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useCoinBasic } from "./useCoinService";

export const useWallets = () => {
  const { popupServerClient } = useClient();

  const allWalletInfo = usePopupSelector(
    (state) => state.account.allWalletInfo,
    isEqual,
  );
  const dispatch = usePopupDispatch();

  const key = `/wallets`;
  const fetchWallets = useCallback(async () => {
    dispatch.account.refreshAllWalletsToStore();
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
    return allWallets.map((w) => ({
      ...w,
      ...(allWalletInfo[w.walletId] || {}),
    }));
  }, [originWallets, allWalletInfo]);

  const addAccount = useCallback(
    async (walletId: string, coinType: CoinType, accountId: string) => {
      try {
        await popupServerClient.addAccount({
          walletId,
          coinType,
          accountId,
        });
        dispatch.account.refreshAllWalletsToStore();
      } catch (e) {
        console.warn("add account error ", e);
      }
    },
    [popupServerClient, dispatch.account],
  );

  return {
    originWallets,
    flattenWalletList,
    error,
    getWallets,
    loadingWallets,
    addAccount,
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
    return selectedWallet?.accountsMap[coinBasic.coinType] || [];
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
