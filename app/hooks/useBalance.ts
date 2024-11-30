import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";

export const useBalance = (
  uniqueId: ChainUniqueId,
  address: string,
  token?: TokenV2,
) => {
  const [balance, setBalance] = useState<bigint | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { coinService } = useCoinService(uniqueId);

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
        const balanceResult = await coinService.getBalance(address);

        setBalance(balanceResult.total);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch balance"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [uniqueId, address, coinService]);

  console.log("      balance " + balance);

  return { balance, loadingBalance: loading, error };
};
