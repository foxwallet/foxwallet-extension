import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useClient } from "./useClient";
import { useCallback } from "react";
import useSWR from "swr";
import { CoinType } from "core/types";

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
