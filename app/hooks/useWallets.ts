import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { CoinType } from "core/types";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useCoinBasic } from "./useCoinService";
import { ChangeWalletNameProps } from "@/scripts/background/servers/IWalletServer";

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

  const flattenWalletList = useMemo(() => {
    if (!wallets) {
      return [];
    }
    const hdWallets = wallets[WalletType.HD] ?? [];
    const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
    return [...hdWallets, ...simpleWallets];
  }, [wallets]);

  return {
    wallets,
    flattenWalletList,
    error,
    getWallets,
    addAccount,
    loadingWallets,
  };
};

export const useCurrWallet = () => {
  const { popupServerClient } = useClient();
  const { getWallets } = useWallets();

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

  const changeWalletName = useCallback(
    async (params: ChangeWalletNameProps) => {
      await popupServerClient.changeWalletName(params);
      getWallets();
    },
    [popupServerClient, getWallets],
  );

  return {
    walletInfo,
    accountsInWallet,
    changeWalletName,
  };
};
