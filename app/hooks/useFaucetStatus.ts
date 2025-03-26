import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback } from "react";
import useSWR from "swr";
import { useCoinService } from "./useCoinService";
import { FaucetStatus } from "core/coins/ALEO/types/Faucet";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { AleoService } from "core/coins/ALEO/service/AleoService";

export const useFaucetStatus = (
  uniqueId: ChainUniqueId,
  account: OneMatchAccount,
) => {
  const { chainConfig, coinService } = useCoinService(uniqueId);

  const fetchFaucetStatus = useCallback(async () => {
    if (!chainConfig.innerFaucet || !(coinService instanceof AleoService)) {
      return;
    }
    const res = await coinService.faucetStatus(account.account.address);
    return res;
  }, [account.account.address, chainConfig.innerFaucet, coinService]);

  const key = `/faucet/${uniqueId}/${account.account.address}`;

  const { data: faucetStatus, mutate: getFaucetStatus } = useSWR(
    key,
    fetchFaucetStatus,
    {
      refreshInterval: 5000,
      fallbackData: {
        status: FaucetStatus.EMPTY,
      },
    },
  );

  return {
    faucetStatus,
    getFaucetStatus,
  };
};
