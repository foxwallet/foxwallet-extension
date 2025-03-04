import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
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
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";
import { AssetType, type TokenV2 } from "core/types/Token";
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import type { TxHistoryPaginationParam } from "core/types/Pagination";
import {
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
    const res = await (coinService as AleoService).getLocalTxHistory(address);
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
              await (coinService as AleoService).setLocalTxNotification(
                tx.localId,
              );
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
      pageSize: 100,
    });
  const [newPagination, setNewPagination] = useState<TxHistoryPaginationParam>({
    pageNum: 0,
    pageSize: 100,
  });

  const key = isAleo
    ? undefined
    : `/tx_history/${token.contractAddress}/${uniqueId}/${address}?page=${currPagination.pageNum}&limit=${currPagination.pageSize}`;
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
    data: txs,
    error: onTxHistoryError,
    mutate: getTxHistory,
    isLoading: loadingTxHistory,
  } = useSWR(key, fetchTxHistory, {
    refreshInterval,
  });

  useEffect(() => {
    if (Array.isArray(txs) && txs.length > 0) {
      setTxHistory((prev) => {
        return uniqBy([...prev, ...txs], "id");
      });
    }
  }, [txs]);

  const getMore = useCallback(() => {
    if (!endReach) {
      setCurrPagination(newPagination);
    }
  }, [endReach, newPagination]);

  const sortedHistory = txHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((item, index, array) => {
      return index === 0 || item.timestamp !== array[index - 1].timestamp;
    });

  const ret = useMemo(() => {
    return {
      history: sortedHistory,
      loading: loadingTxHistory,
      error: onTxHistoryError,
      getMore,
    };
  }, [getMore, loadingTxHistory, onTxHistoryError, sortedHistory]);

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

  let tokenId = token.tokenId;
  let programId = token.programId;

  if (isAleo) {
    const { programId: _programId, tokenId: _tokenId } = (
      coinService as AleoService
    ).parseContractAddress(token.contractAddress);
    tokenId = token.tokenId ?? _tokenId;
    programId = token.programId ?? _programId;
  }

  // local txs
  const localTxKey = `/localTxs/${uniqueId}/${address}/${token.contractAddress}/${tokenId}/${programId}`;
  const getLocalTxs = useCallback(async () => {
    if (isAleo) {
      const res = await (coinService as AleoService).getLocalTxHistory(
        address,
        tokenId !== NATIVE_TOKEN_TOKEN_ID ? programId : undefined,
        tokenId,
      );
      return res;
    }
    return [];
  }, [isAleo, coinService, address, tokenId, programId]);
  const {
    data: localTxs,
    error: localTxsError,
    isLoading: loadingLocalTxs,
  } = useSWR(localTxKey, getLocalTxs, { refreshInterval });
  // console.log("      localTxs", localTxs);

  // private txs
  const privateTxsKey = `/privateTxs/${token.contractAddress}/${uniqueId}/${address}/${tokenId}/${programId}`;
  const getPrivateTxs = useCallback(async () => {
    if (isAleo) {
      const res = await (coinService as AleoService).getPrivateTxHistory(
        address,
        tokenId !== NATIVE_TOKEN_TOKEN_ID ? programId : undefined,
        tokenId,
      );
      return res;
    }
    return [];
  }, [isAleo, coinService, address, tokenId, programId]);
  const {
    data: privateTxs,
    error: privateTxsError,
    isLoading: loadingPrivateTxs,
  } = useSWR(privateTxsKey, getPrivateTxs, { refreshInterval });

  // on chain txs by api.aleo.info
  const [endReach, setEndReach] = useState(false);
  const [currPagination, setCurrPagination] =
    useState<TxHistoryPaginationParam>({
      pageNum: 0,
      pageSize: 100,
    });
  const [newPagination, setNewPagination] = useState<TxHistoryPaginationParam>({
    pageNum: 0,
    pageSize: 100,
  });
  const key = isAleo
    ? `/onChainTxs/${token.contractAddress}/${uniqueId}/${address}/${tokenId}/${programId}?page=${currPagination.pageNum}&limit=${currPagination.pageSize}`
    : undefined;

  const fetchOnChainHistory = useCallback(async () => {
    try {
      let res: TransactionHistoryResp | undefined;

      if (
        token.type === AssetType.COIN &&
        coinService.supportNativeCoinTxHistory()
      ) {
        res = await coinService.getNativeCoinTxHistory({
          address,
          pagination: currPagination,
        });
      } else if (coinService.supportTokenTxHistory()) {
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
  }, [token, coinService, address, currPagination]);

  const [onChainHistory, setOnChainHistory] = useState<
    TransactionHistoryItem[]
  >([]);

  const {
    data: onChainTxs,
    error: onChainError,
    mutate: getOnChainHistory,
    isLoading: loadingOnChainTxs,
  } = useSWR(key, fetchOnChainHistory, {
    refreshInterval,
  });

  useEffect(() => {
    if (Array.isArray(onChainTxs) && onChainTxs.length > 0) {
      setOnChainHistory((prev) => {
        return uniqBy([...prev, ...onChainTxs], "id");
      });
    }
  }, [onChainTxs]);

  const getMore = useCallback(() => {
    if (!endReach) {
      setCurrPagination(newPagination);
    }
  }, [endReach, newPagination]);

  // organize data
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

    const onChainFinalizedTxs: AleoOnChainHistoryItem[] = onChainHistory.map(
      (tx) => {
        const type =
          tx.from === address
            ? AleoTxAddressType.SEND
            : AleoTxAddressType.RECEIVE;
        // debugger;
        const item: AleoOnChainHistoryItem = {
          addressType: type,
          functionName: tx.functionName ?? "",
          height: tx.height,
          programId: tx.programId ?? "",
          status: AleoTxStatus.FINALIZD, // todo 需要确认
          timestamp: tx.timestamp,
          txId: tx.id,
          txType: AleoTxType.EXECUTION, // todo 需要确认
          type: AleoHistoryType.ON_CHAIN,
          from: tx.from,
          to: tx.to,
          amount: String(tx.value),
        };
        return item;
      },
    );

    const completedTxs = uniqBy(
      [...completedLocalTxs, ...privateFinalizedTxs, ...onChainFinalizedTxs],
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
  }, [address, localTxs, onChainHistory, privateTxs]);

  return {
    loading:
      loadingLocalTxs || loadingPrivateTxs || loadingOnChainTxs || loading,
    loadingLocalTxs,
    loadingPrivateTxs,
    loadingOnChainTxs,
    error: localTxsError || privateTxsError || onChainError,
    history,
    getMore,
  };
};
