import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { CoinType } from "core/types";
import { useCurrAccount } from "./useCurrAccount";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useCoinBasic } from "./useCoinService";

export const useWallets = () => {
  const { popupServerClient } = useClient();

  const key = `/wallets`;
  const fetchWallets = useCallback(async () => {
    return await popupServerClient.getAllWallet();
  }, [popupServerClient]);

  const {
    data: wallets,
    error,
    mutate: getWallets,
    isLoading: loadingWallets,
  } = useSWR(key, fetchWallets);

  const addAccount = useCallback(
    async (walletId: string, coinType: CoinType, accountId: string) => {
      await popupServerClient.addAccount({ walletId, coinType, accountId });
      getWallets();
    },
    [popupServerClient, getWallets],
  );

  return {
    wallets,
    error,
    getWallets,
    addAccount,
    loadingWallets,
  };
};

export const useCurrWallet = () => {
  const { selectedAccount, walletInfo, uniqueId } = usePopupSelector(
    (state) => ({
      selectedAccount: state.account.selectedAccount,
      uniqueId: state.account.selectedUniqueId,
      walletInfo: state.account.walletInfo,
    }),
    isEqual,
  );
  const coinBasic = useCoinBasic(uniqueId);

  const accountsInWallet = useMemo(() => {
    return walletInfo?.accountsMap[coinBasic.coinType] || [];
  }, [walletInfo, coinBasic]);

  const dispatch = usePopupDispatch();
  useEffect(() => {
    dispatch.account.getCurrWalletInfo(selectedAccount.walletId);
  }, [dispatch.account, selectedAccount.walletId]);

  return {
    walletInfo,
    accountsInWallet,
  };
};
