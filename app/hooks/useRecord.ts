import type { ChainUniqueId } from "core/types/ChainUniqueId";
import useSWR from "swr";
import { useClient } from "./useClient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCoinService } from "./useCoinService";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { CoinType } from "core/types";
import { set } from "lodash";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";

export const useRecords = (
  uniqueId: ChainUniqueId,
  address: string,
  recordFilter: RecordFilter = RecordFilter.UNSPENT,
  programId: string = NATIVE_TOKEN_PROGRAM_ID,
) => {
  const { coinService } = useCoinService(uniqueId);
  const coinType = useMemo(() => {
    return chainUniqueIdToCoinType(uniqueId);
  }, [uniqueId]);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordDetailWithSpent[]>([]);

  const fetchRecords = useCallback(async () => {
    if (coinType !== CoinType.ALEO) {
      return;
    }
    setLoading(true);
    try {
      const result = await coinService.getRecords(
        address,
        programId,
        recordFilter,
      );
      const nonZeroRecords = result.filter((record) => {
        return record.parsedContent?.microcredits !== 0n;
      });
      setRecords([...nonZeroRecords]);
    } catch (err) {
      console.log("===> fetch record error: ", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [coinType, coinService, address, programId, recordFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const res = useMemo(() => {
    if (coinType !== CoinType.ALEO) {
      return {
        loading: false,
        records,
        fetchRecords,
      };
    }
    return {
      loading,
      records,
      fetchRecords,
    };
  }, [loading, records, fetchRecords]);

  return res;
};
