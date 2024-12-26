import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { type Pagination } from "core/coins/ALEO/types/Pagination";
import {
  type AleoHistoryItem,
  AleoHistoryType,
  type AleoLocalHistoryItem,
  type AleoOnChainHistoryItem,
  AleoTxAddressType,
  AleoTxType,
} from "core/coins/ALEO/types/History";
import { isEqual, uniqBy } from "lodash";
import { AleoTxStatus } from "core/coins/ALEO/types/Transaction";
import { useTransactionSettledToast } from "@/components/Wallet/TransactionSettledToast/useTransactionSettledToast";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { AssetType, type TokenV2 } from "core/types/Token";
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import type { TxHistoryPaginationParam } from "core/types/Pagination";
import {
  type ExtraTxHistoryPaginationParam,
  type TransactionHistoryItem,
  type TransactionHistoryResp,
} from "core/types/TransactionHistory";
import { logger } from "@/common/utils/logger";

const NotificationExpiredTime = 1000 * 60 * 60 * 5;

export const useTxsNotification = (
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
        default:
          return false;
      }
    });
  }, [localTxs]);

  // show toast for new settled txs
  const { showToast } = useTransactionSettledToast();

  useEffect(() => {
    async function notification() {
      try {
        if (newSettledTxs.length > 0) {
          for (const tx of newSettledTxs) {
            if (!notifiedTxs.current.includes(tx.localId)) {
              notifiedTxs.current.push(tx.localId);
              if (Date.now() - tx.timestamp <= NotificationExpiredTime) {
                showToast(tx.status === AleoTxStatus.FINALIZD);
              }
              await coinService.setLocalTxNotification(tx.localId);
            }
          }
        }
      } catch (err) {
        console.error("notification error: ", err);
      }
    }
    void notification();
  }, [newSettledTxs, showToast, coinService]);
};

export const useTxHistory = ({
  uniqueId,
  address,
  token,
  refreshInterval,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: TokenV2;
  refreshInterval?: number;
}) => {
  const { coinService } = useCoinService(uniqueId);
  const isAleo = useMemo(() => {
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET;
  }, [uniqueId]);

  const [endReach, setEndReach] = useState(false);
  const [txHistory, setTxHistory] = useState<TransactionHistoryItem[]>([]);

  const [currPagination, setCurrPagination] =
    useState<TxHistoryPaginationParam>({
      pageNum: 0,
      pageSize: 0,
    });
  const [newPagination, setNewPagination] = useState<TxHistoryPaginationParam>({
    pageNum: 0,
    pageSize: 0,
  });

  const key = `/tx_history/${uniqueId}/${address}?page=${currPagination.pageNum}&limit=${currPagination.pageSize}`;
  const fetchTxHistory = useCallback(async () => {
    if (!isAleo) {
      try {
        let res: TransactionHistoryResp | undefined;
        if (token.type === AssetType.COIN) {
          res = await coinService.getNativeCoinTxHistory({
            address,
            pagination: currPagination,
          });
        } else {
          res = await coinService.getTokenTxHistory({
            address,
            token,
            pagination: currPagination,
          });
        }
        if (res) {
          setNewPagination(res.pagination);
          setEndReach(res.pagination.endReach);
          return res.txs;
        }
      } catch (e) {
        logger.log("===> fetchTxHistory failed: ");
        return [];
      }
    }
    return [];
  }, [isAleo, token, coinService, address, currPagination]);

  const {
    error: onTxHistoryError,
    mutate: getTxHistory,
    isLoading: loadingTxHistory,
  } = useSWR(key, fetchTxHistory, {
    refreshInterval,
    onSuccess: (curr) => {
      setTxHistory((prev) => {
        return uniqBy([...prev, ...curr], "id");
      });
    },
  });

  const getMore = useCallback(() => {
    if (!endReach) {
      setCurrPagination(newPagination);
    }
  }, [endReach, newPagination]);

  const ret = useMemo(() => {
    return {
      history: txHistory,
      loading: loadingTxHistory,
      error: onTxHistoryError,
      getMore,
    };
  }, [getMore, loadingTxHistory, onTxHistoryError, txHistory]);

  return ret;
};

export const useAleoTxHistory = ({
  uniqueId,
  address,
  token,
  refreshInterval,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: TokenV2;
  refreshInterval?: number;
}) => {
  const { coinService } = useCoinService(uniqueId);
  const isAleo = useMemo(() => {
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET;
  }, [uniqueId]);

  const localTxKey = `/localTxs/${uniqueId}/${address}/${token.tokenId}`;
  const getLocalTxs = useCallback(async () => {
    if (isAleo) {
      const res = await (coinService as AleoService).getLocalTxHistory(
        address,
        token.tokenId !== NATIVE_TOKEN_TOKEN_ID ? token.programId : undefined,
        token.tokenId,
      );
      return res;
    }
    return [];
  }, [isAleo, coinService, address, token]);
  const {
    data: localTxs,
    error: localTxsError,
    isLoading: loadingLocalTxs,
  } = useSWR(localTxKey, getLocalTxs, { refreshInterval });

  const privateTxsKey = `/privateTxs/${uniqueId}/${address}/${token.tokenId}`;
  const getPrivateTxs = useCallback(async () => {
    if (isAleo) {
      const res = await (coinService as AleoService).getPrivateTxHistory(
        address,
        token.tokenId !== NATIVE_TOKEN_TOKEN_ID ? token.programId : undefined,
        token.tokenId,
      );
      return res;
    }
    return [];
  }, [isAleo, coinService, address, token]);
  const {
    data: privateTxs,
    error: privateTxsError,
    isLoading: loadingPrivateTxs,
  } = useSWR(privateTxsKey, getPrivateTxs, { refreshInterval });

  const [pagination, setPagination] = useState<Pagination>({});
  const key = `/onchain_history/${uniqueId}/${address}?page=${pagination.cursor}&limit=${pagination.limit}`;
  const fetchOnChainHistory = useCallback(async () => {
    if (isAleo) {
      if (
        token.programId === ALPHA_TOKEN_PROGRAM_ID ||
        token.programId === BETA_STAKING_PROGRAM_ID
      ) {
        return await (coinService as AleoService).getTokenOnChainHistory({
          address,
          pagination,
          token,
        });
      }
      const res = await (coinService as AleoService).getOnChainHistory({
        address,
        pagination,
      });
      return res;
    }
    return [];
  }, [isAleo, token, coinService, address, pagination]);

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
    for (const tx of localTxs ?? []) {
      if (tx.txId) {
        completedLocalTxs.push(tx);
      } else {
        uncompletedLocalTxs.push(tx);
      }
    }

    const privateFinalizedTxs: AleoOnChainHistoryItem[] = [];

    for (const privateTx of privateTxs ?? []) {
      if (privateTx.executionRecords.length === 0) {
        continue;
      }
      const item: AleoOnChainHistoryItem = {
        txId: privateTx.txId,
        txType: AleoTxType.EXECUTION,
        height: privateTx.height,
        programId: privateTx.executionRecords[0].programId,
        functionName: privateTx.executionRecords[0].functionName,
        timestamp: privateTx.executionRecords[0].timestamp,
        type: AleoHistoryType.ON_CHAIN,
        addressType: AleoTxAddressType.SEND,
        status: AleoTxStatus.FINALIZD,
      };
      privateFinalizedTxs.push(item);
    }

    const completedTxs = uniqBy(
      [...completedLocalTxs, ...privateFinalizedTxs, ...onChainHistory],
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
  }, [localTxs, onChainHistory, privateTxs]);

  return {
    loading:
      loadingLocalTxs || loadingPrivateTxs || loadingOnChainHistory || loading,
    loadingLocalTxs,
    loadingPrivateTxs,
    loadingOnChainHistory,
    error: localTxsError || privateTxsError || onChainHistoryError,
    history,
    getMore,
  };
};
