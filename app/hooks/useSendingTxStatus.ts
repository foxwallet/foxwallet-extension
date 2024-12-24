import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useClient } from "./useClient";
import useSWR from "swr";

export const useIsSendingAleoTx = (uniqueId: ChainUniqueId) => {
  const { popupServerClient } = useClient();
  const key = `/sending_tx/${uniqueId}`;
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
