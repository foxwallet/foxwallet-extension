import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useClient } from "./useClient";
import useSWR from "swr";

export const useIsSendingAleoTx = () => {
  const { popupServerClient } = useClient();
  // todo: does it need to handle with testnet?
  const key = `/sending_tx/${InnerChainUniqueId.ALEO_MAINNET}`;
  const fetchStatus = useCallback(async () => {
    return await popupServerClient.isSendingAleoTransaction();
  }, [popupServerClient]);

  const {
    data: sendingAleoTx,
    error,
    mutate: getSendingAleoTx,
    isLoading: loadingStatus,
  } = useSWR(key, fetchStatus, {
    refreshInterval: 500,
  });

  const res = useMemo(() => {
    return {
      sendingAleoTx,
      error,
      getSendingAleoTx,
      loadingStatus,
    };
  }, [sendingAleoTx, error, getSendingAleoTx, loadingStatus]);

  return res;
};
