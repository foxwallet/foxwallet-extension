import { DisplayAccount } from "@/scripts/background/store/vault/types/keyring";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback } from "react";
import useSWR from "swr";
import { useCoinService } from "./useCoinService";
import { FaucetStatus } from "core/coins/ALEO/types/Faucet";

export const useFaucetStatus = (
  uniqueId: ChainUniqueId,
  account: DisplayAccount,
) => {
  const { chainConfig, coinService } = useCoinService(uniqueId);

  const fetchFaucetStatus = useCallback(async () => {
    if (!chainConfig.innerFaucet) {
      return;
    }
    const res = await coinService.faucetStatus(account.address);
    return res;
  }, [account, coinService]);

  const key = `/faucet/${uniqueId}/${account.address}`;

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
