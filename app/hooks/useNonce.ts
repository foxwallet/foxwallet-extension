import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useEffect, useState } from "react";

export const useNonce = (uniqueId: ChainUniqueId, address: string) => {
  const [nonce, setNonce] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { coinService } = useCoinService(uniqueId);

  useEffect(() => {
    if (!coinService.validateAddress(address)) {
      setNonce(undefined);
      setLoading(false);
      setError(new Error("Data error"));
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const nonce = await coinService.getNonce({ address });

        setNonce(nonce);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch nonce"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [uniqueId, address, coinService]);

  return { nonce, loadingNonce: loading, error };
};
