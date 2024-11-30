import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";

export const useBalance = (
  uniqueId: ChainUniqueId,
  address: string,
  token?: TokenV2,
) => {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { coinService } = useCoinService(uniqueId);

  useEffect(() => {
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

  return { balance, loadingBalance: loading, error };
};
