import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useCoinService } from "@/hooks/useCoinService";

export type TransactionDetailReq = {
  uniqueId: ChainUniqueId;
  address: string;
  txId?: string;
  token: TokenV2;
  filter?: {
    address?: string;
    logIndex?: number;
    addressType?: "sender" | "receiver";
  };
  auth?: { [key: string]: string };
  refreshInterval?: number;
};

export const useTransactionDetail = (params: TransactionDetailReq) => {
  const {
    uniqueId,
    address,
    txId,
    token,
    refreshInterval = 8000,
    filter,
    auth,
  } = params;
  const { coinService } = useCoinService(uniqueId);

  const isAleo =
    uniqueId === InnerChainUniqueId.ALEO_MAINNET ||
    uniqueId === InnerChainUniqueId.ALEO_TESTNET;

  const key = useMemo(() => {
    return `/transaction_detail/${uniqueId}/${txId}`;
  }, [txId, uniqueId]);

  const fetchDetail = useCallback(async () => {
    let res;

    if (isAleo) {
      if (!coinService.supportGetTxStatus() || !txId) {
        return;
      }
      const res = await coinService.getTxStatus({
        txId,
        filter: filter ?? { address },
        auth,
      });
      if (res) {
        const {
          fee,
          height,
          confirmations,
          timestamp,
          status,
          from,
          to,
          value,
        } = res;
        return {
          fees: fee,
          height,
          confirmations,
          timestamp,
        };
      }
    } else {
      if (token.type === AssetType.COIN) {
        if (!coinService.supportNativeCoinTxDetail() || !txId) {
          return undefined;
        }
        res = await coinService.getNativeCoinTxDetail({
          txId,
          filter: filter ?? { address },
          auth,
        });
      } else {
        if (!coinService.supportTokenTxDetail() || !txId) {
          return undefined;
        }
        res = await coinService.getTokenTxDetail({
          txId,
          token,
          filter: filter ?? { address },
        });
      }
    }
    // console.log("      res", res);
    return res;
  }, [address, auth, coinService, filter, isAleo, token, txId]);

  const {
    data: evmData,
    error,
    mutate: getTransactionDetail,
    isLoading,
  } = useSWR(key, fetchDetail, {
    refreshInterval,
  });

  const res = useMemo(() => {
    return {
      data: evmData,
      error,
      getTransactionDetail,
      isLoading,
    };
  }, [evmData, error, getTransactionDetail, isLoading]);

  return res;
};
