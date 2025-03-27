import { useCallback, useEffect, useMemo, useState } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "@/hooks/useCoinService";
import type { TokenV2 } from "core/types/Token";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { usePopupDispatch } from "@/hooks/useStore";
import { useDebounce } from "use-debounce";

export const useSearchTokens = <T>(searchText: string, targetList: T[]) => {
  const fuseOptions = useMemo(() => {
    return {
      keys: [
        { name: "contractAddress", weight: 0.5 },
        { name: "symbol", weight: 0.5 },
      ],
      threshold: 0.1,
    };
  }, []);

  const { searchRes, searching, delaySearchStr } = useFuseSearch(
    searchText,
    targetList,
    fuseOptions,
  );

  return {
    searchRes,
    searching,
    delaySearchStr,
  };
};

export const useSearchTokensByRpc = (
  searchText: string,
  uniqueId: ChainUniqueId,
) => {
  const { coinService } = useCoinService(uniqueId);
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);
  const dispatch = usePopupDispatch();

  const [contractAddress] = useDebounce(searchText, 500);
  const [loading, setLoading] = useState<boolean>(false);
  const [resToken, setResToken] = useState<TokenV2 | undefined>(undefined);

  const searchByRpc = useCallback(async () => {
    if (
      !coinService.validateAddress(contractAddress) ||
      !coinService.supportToken()
    ) {
      return undefined;
    }

    try {
      console.log("searchByRpc start", contractAddress);
      setLoading(true);
      const token = await coinService.getTokenMeta({ contractAddress });
      console.log("------- searchByRpc", token);
      if (token && token.contractAddress && token.symbol) {
        try {
          const tokenBalance = await coinService.getTokenBalance({
            address: selectedAccount.account.address,
            token,
          });
          if (tokenBalance?.total) {
            dispatch.coinBalanceV2.updateCoinBalance({
              uniqueId,
              address: selectedAccount.account.address,
              contractAddress: token.contractAddress,
              balanceItem: {
                total: tokenBalance.total,
                privateBalance: tokenBalance.privateBalance,
                publicBalance: tokenBalance.publicBalance,
              },
            });
          }
        } catch (err) {
          console.log(err);
        }
        setResToken(token as TokenV2);
      }
    } catch (err) {
      console.log("searchByRpc failed", err);
    } finally {
      setLoading(false);
    }
  }, [
    coinService,
    contractAddress,
    dispatch.coinBalanceV2,
    selectedAccount.account.address,
    uniqueId,
  ]);

  useEffect(() => {
    searchByRpc();
  }, [searchByRpc, contractAddress]);

  return {
    searchRes: resToken,
    searching: loading,
    delaySearchStr: contractAddress,
  };
};
