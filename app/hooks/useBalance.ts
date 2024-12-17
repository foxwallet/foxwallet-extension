import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useCallback, useMemo } from "react";
import useSWR from "swr";

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
    return coinService.validateAddress(address);
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

  /*
  useEffect(() => {
    if (!coinService.validateAddress(address)) {
      setBalance(undefined);
      setLoading(false);
      setError(new Error("Data error"));
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);

        if (token) {
          const res = await coinService.getTokenBalance({
            address,
            token,
          });
          setBalance(res ? res.total : undefined);
        } else {
          const balanceResult = await coinService.getBalance(address);
          setBalance(balanceResult.total);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch balance"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [token, uniqueId, address, coinService]);
  */

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
