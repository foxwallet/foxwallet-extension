import type { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useEffect, useMemo } from "react";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { CoinType } from "core/types";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import { useClient } from "./useClient";
import { useCoinService } from "./useCoinService";
import useSWR from "swr";
import { type ViewRefreshMode } from "core/coins/ALEO/service/scanner";

const RECORD_REFRESH_INTERVAL = 15 * 1000;

const recordFilterToUnspent = (
  recordFilter: RecordFilter,
): boolean | undefined => {
  switch (recordFilter) {
    case RecordFilter.UNSPENT:
      return true;
    case RecordFilter.SPENT:
      return false;
    case RecordFilter.ALL:
      return undefined;
    default:
      return undefined;
  }
};

export const useRecords = ({
  uniqueId,
  address,
  recordFilter = RecordFilter.UNSPENT,
  programId = NATIVE_TOKEN_PROGRAM_ID,
  refreshInterval = RECORD_REFRESH_INTERVAL,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  recordFilter?: RecordFilter;
  programId?: string;
  refreshInterval?: number;
}) => {
  const { chainConfig } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const coinType = useMemo(() => {
    return chainUniqueIdToCoinType(uniqueId);
  }, [uniqueId]);
  const consumerId = useMemo(() => {
    return [
      "aleo:records",
      chainConfig.chainId,
      address,
      programId,
      recordFilter,
    ].join(":");
  }, [address, chainConfig.chainId, programId, recordFilter]);

  const fetchScannerRecords = useCallback(
    async (
      refreshMode: ViewRefreshMode = "auto",
    ): Promise<RecordDetailWithSpent[]> => {
      if (coinType !== CoinType.ALEO || !address) {
        return [];
      }
      const unspent = recordFilterToUnspent(recordFilter);
      const result = await popupServerClient.scannerGetDecryptedOwnedRecords({
        chainId: chainConfig.chainId,
        address,
        programs: [programId],
        ...(unspent !== undefined ? { unspent } : {}),
        consumerId,
        purpose: "view",
        refreshMode,
      });
      return result.filter((record) => {
        return record.parsedContent?.microcredits !== 0n;
      });
    },
    [
      address,
      chainConfig.chainId,
      coinType,
      consumerId,
      popupServerClient,
      programId,
      recordFilter,
    ],
  );

  const key = useMemo(() => {
    if (coinType !== CoinType.ALEO) {
      return null;
    }
    if (!address) {
      return null;
    }
    return [
      "aleo_records",
      uniqueId,
      chainConfig.chainId,
      address,
      programId,
      recordFilter,
    ];
  }, [
    address,
    chainConfig.chainId,
    coinType,
    programId,
    recordFilter,
    uniqueId,
  ]);

  const {
    data,
    error,
    mutate,
    isLoading: loadingRecords,
    isValidating,
  } = useSWR<RecordDetailWithSpent[]>(
    key,
    async () => {
      return await fetchScannerRecords("auto");
    },
    {
      refreshInterval,
    },
  );

  const fetchRecords = useCallback(async () => {
    const nextRecords = await fetchScannerRecords("hard");
    await mutate(nextRecords, {
      populateCache: true,
      revalidate: false,
    });
    return nextRecords;
  }, [fetchScannerRecords, mutate]);

  useEffect(() => {
    return () => {
      void popupServerClient.scannerDeactivateViewConsumer({ consumerId });
    };
  }, [consumerId, popupServerClient]);

  const res = useMemo(() => {
    const records = data ?? [];
    if (coinType !== CoinType.ALEO) {
      return {
        loading: false,
        records,
        fetchRecords,
        error: undefined,
        consumerId,
        validating: false,
      };
    }
    return {
      loading: loadingRecords,
      records,
      fetchRecords,
      error,
      consumerId,
      validating: isValidating,
    };
  }, [
    coinType,
    consumerId,
    data,
    error,
    fetchRecords,
    isValidating,
    loadingRecords,
  ]);

  return res;
};
