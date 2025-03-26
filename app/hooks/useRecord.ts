import type { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCoinService } from "./useCoinService";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { CoinType } from "core/types";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";

export const useRecords = ({
  uniqueId,
  address,
  recordFilter = RecordFilter.UNSPENT,
  programId = NATIVE_TOKEN_PROGRAM_ID,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  recordFilter?: RecordFilter;
  programId?: string;
}) => {
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
    void fetchRecords();
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
  }, [coinType, loading, records, fetchRecords]);

  return res;
};
