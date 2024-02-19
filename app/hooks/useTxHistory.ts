import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Pagination } from "core/coins/ALEO/types/Pagination";
import {
  AleoHistoryItem,
  AleoLocalHistoryItem,
  AleoOnChainHistoryItem,
} from "core/coins/ALEO/types/History";
import { isEqual, uniqBy } from "lodash";
import { AleoTxStatus } from "core/coins/ALEO/types/Transaction";

export const useTxHistory = (
  uniqueId: ChainUniqueId,
  address: string,
  refreshInterval?: number,
) => {
  const { coinService } = useCoinService(uniqueId);

  const localTxKey = `/localTxs/${uniqueId}/${address}`;
  const getLocalTxs = useCallback(async () => {
    const res = await coinService.getLocalTxHistory(address);
    return res;
  }, [coinService, address]);
  const {
    data: localTxs,
    error: localTxsError,
    isLoading: loadingLocalTxs,
  } = useSWR(localTxKey, getLocalTxs, { refreshInterval });

  const [pagination, setPagination] = useState<Pagination>({});
  const key = `/onchain_history/${uniqueId}/${address}?page=${pagination.cursor}&limit=${pagination.limit}`;
  const fetchOnChainHistory = useCallback(async () => {
    const res = await coinService.getOnChainHistory(address, pagination);
    return res;
  }, [coinService, address, pagination]);
  const [onChainHistory, setOnChainHistory] = useState<
    AleoOnChainHistoryItem[]
  >([]);
  const {
    error: onChainHistoryError,
    mutate: getOnChainHistory,
    isLoading: loadingOnChainHistory,
  } = useSWR(key, fetchOnChainHistory, {
    refreshInterval,
    onSuccess: (curr) => {
      setOnChainHistory((prev) => {
        return uniqBy([...prev, ...curr], "txId");
      });
    },
  });

  const getMore = useCallback(() => {
    if (onChainHistory.length > 0) {
      setPagination({
        cursor: onChainHistory[onChainHistory.length - 1].height.toString(),
      });
    }
  }, [onChainHistory]);

  const [history, setHistory] = useState<AleoHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const uncompletedLocalTxs: AleoLocalHistoryItem[] = [];
    const completedLocalTxs: AleoLocalHistoryItem[] = [];
    for (let tx of localTxs || []) {
      if (tx.txId) {
        completedLocalTxs.push(tx);
      } else {
        uncompletedLocalTxs.push(tx);
      }
    }
    const completedTxs = uniqBy(
      [...completedLocalTxs, ...onChainHistory],
      "txId",
    );
    const txs = [...uncompletedLocalTxs, ...completedTxs];
    txs.sort((item1, item2) => {
      if (
        (item1 as AleoOnChainHistoryItem).height &&
        (item2 as AleoOnChainHistoryItem).height
      ) {
        return (
          (item2 as AleoOnChainHistoryItem).height -
          (item1 as AleoOnChainHistoryItem).height
        );
      }
      return item2.timestamp - item1.timestamp;
    });
    setLoading(false);
    setHistory((prev) => {
      if (!isEqual(prev, txs)) {
        return txs;
      }
      return prev;
    });
  }, [localTxs, onChainHistory]);

  const notifiedTxs = useRef<string[]>([]);
  const newSettledTxs = useMemo(() => {
    if (!localTxs) {
      return [];
    }
    return localTxs.filter((item) => {
      if (!item) return false;
      if (item.notification) return false;
      switch (item.status) {
        case AleoTxStatus.QUEUED:
        case AleoTxStatus.GENERATING_PROVER_FILES:
        case AleoTxStatus.GENERATING_TRANSACTION:
        case AleoTxStatus.BROADCASTING:
        case AleoTxStatus.COMPLETED:
        case AleoTxStatus.UNACCEPTED: {
          return false;
        }
        case AleoTxStatus.FAILED:
        case AleoTxStatus.FINALIZD:
        case AleoTxStatus.REJECTED: {
          return true;
        }
      }
    });
  }, [localTxs]);

  useEffect(() => {
    if (newSettledTxs.length > 0) {
      for (let tx of newSettledTxs) {
        if (!notifiedTxs.current.includes(tx.localId)) {
          notifiedTxs.current.push(tx.localId);
        }
      }
    }
  }, [newSettledTxs]);

  return {
    loading: loadingLocalTxs || loadingOnChainHistory || loading,
    loadingLocalTxs,
    loadingOnChainHistory,
    error: localTxsError || onChainHistoryError,
    history,
    getMore,
  };
};
