import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import type { AleoService } from "core/coins/ALEO/service/AleoService";

export type BalanceReq = {
  uniqueId: ChainUniqueId;
  address: string;
  token?: TokenV2;
  refreshInterval?: number;
};

export const useBalance = (params: BalanceReq) => {
  const { uniqueId, address, token, refreshInterval = 4000 } = params;
  const { coinService } = useCoinService(uniqueId);

  const isAddressValid = useMemo(() => {
    // todo
    // return coinService.validateAddress(address);
    return true;
  }, [address, coinService]);

  const key = useMemo(() => {
    return `/balance/${[
      uniqueId,
      address,
      token?.name,
      token?.symbol,
      token?.contractAddress,
      token?.tokenId,
      token?.programId,
    ]
      .filter((item) => !!item)
      .join("/")}`;
  }, [address, token, uniqueId]);

  const fetchBalance = useCallback(async () => {
    if (!isAddressValid) {
      return undefined;
    }
    if (token?.type === AssetType.TOKEN) {
      if (
        token?.uniqueId === InnerChainUniqueId.ALEO_MAINNET &&
        token?.programId &&
        token?.tokenId
      ) {
        return await (coinService as AleoService).getTokenBalanceOld(
          address,
          token.programId,
          token.tokenId,
        );
      }
      return await coinService.getTokenBalance({ address, token });
    }
    return await coinService.getBalance(address);
  }, [address, coinService, isAddressValid, token]);

  const {
    data: balance,
    error,
    mutate: getBalance,
    isLoading: loadingBalance,
  } = useSWR(isAddressValid ? key : null, fetchBalance, {
    refreshInterval,
  });

  const res = useMemo(() => {
    if (!isAddressValid) {
      return {
        balance: undefined,
        error: new Error("Data error"),
        getBalance: undefined,
        loadingBalance: false,
      };
    }
    return {
      balance,
      error,
      getBalance,
      loadingBalance,
    };
  }, [balance, error, getBalance, isAddressValid, loadingBalance]);

  return res;
};
