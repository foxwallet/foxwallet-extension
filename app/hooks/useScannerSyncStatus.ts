import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useClient } from "./useClient";
import { useCoinService } from "./useCoinService";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { CoinType } from "core/types";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type SyncStatusResp } from "core/coins/ALEO/service/scanner";

const SCANNER_SYNC_STATUS_REFRESH_INTERVAL = 2 * 1000;

export const useScannerSyncStatus = ({
  uniqueId,
  address,
  refreshInterval = SCANNER_SYNC_STATUS_REFRESH_INTERVAL,
}: {
  uniqueId: ChainUniqueId;
  address?: string;
  refreshInterval?: number;
}) => {
  const { chainConfig } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const coinType = useMemo(() => {
    return chainUniqueIdToCoinType(uniqueId);
  }, [uniqueId]);

  const key = useMemo(() => {
    if (coinType !== CoinType.ALEO || !address) {
      return null;
    }
    return ["aleo_scanner_sync_status", chainConfig.chainId, address];
  }, [address, chainConfig.chainId, coinType]);

  const fetchSyncStatus = useCallback(async () => {
    if (coinType !== CoinType.ALEO || !address) {
      return undefined;
    }
    await popupServerClient.scannerRegister({
      chainId: chainConfig.chainId,
      address,
    });
    return await popupServerClient.scannerGetSyncStatus({
      chainId: chainConfig.chainId,
      address,
    });
  }, [address, chainConfig.chainId, coinType, popupServerClient]);

  const {
    data: syncStatus,
    error,
    mutate: getSyncStatus,
    isLoading: loadingSyncStatus,
    isValidating,
  } = useSWR<SyncStatusResp | undefined>(key, fetchSyncStatus, {
    refreshInterval: (latestStatus) => {
      if (latestStatus?.synced) {
        return 0;
      }
      return refreshInterval;
    },
  });

  const res = useMemo(() => {
    if (coinType !== CoinType.ALEO || !address) {
      return {
        syncStatus: undefined,
        error: undefined,
        getSyncStatus,
        loadingSyncStatus: false,
      };
    }
    return {
      syncStatus,
      error,
      getSyncStatus,
      loadingSyncStatus: loadingSyncStatus || isValidating,
    };
  }, [
    address,
    coinType,
    error,
    getSyncStatus,
    isValidating,
    loadingSyncStatus,
    syncStatus,
  ]);

  return res;
};
