import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { usePopupDispatch } from "@/hooks/useStore";
import { type BalanceResp } from "core/types/Balance";

export type BalanceReq = {
  uniqueId: ChainUniqueId;
  address: string;
  token?: TokenV2;
  refreshInterval?: number;
};

export const useBalance = (params: BalanceReq) => {
  const { uniqueId, address, token, refreshInterval = 4000 } = params;
  const { coinService } = useCoinService(uniqueId);
  const dispatch = usePopupDispatch();

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
    let balance: BalanceResp | undefined;
    if (token?.type === AssetType.TOKEN) {
      if (token?.contractAddress) {
        balance = await coinService.getTokenBalance({
          address,
          token: { contractAddress: token.contractAddress },
        });
      } else {
        if (
          uniqueId === InnerChainUniqueId.ALEO_MAINNET &&
          token?.programId &&
          token?.tokenId
        ) {
          balance = await coinService.getTokenBalance({
            address,
            token: { contractAddress: `${token.programId}-${token.tokenId}` },
          });
        }
      }
    } else {
      balance = await coinService.getBalance(address);
    }
    if (balance) {
      const { total, privateBalance, publicBalance } = balance;
      dispatch.coinBalanceV2.updateCoinBalance({
        uniqueId,
        address,
        contractAddress: token?.contractAddress ?? "",
        balanceItem: { total, privateBalance, publicBalance },
      });
    }

    return balance;
  }, [
    address,
    coinService,
    dispatch.coinBalanceV2,
    isAddressValid,
    token,
    uniqueId,
  ]);

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
