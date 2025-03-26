import { useEffect, useMemo, useState } from "react";
import { type CoinType } from "core/types";
import { useClient } from "@/hooks/useClient";
import { useCurrWallet } from "@/hooks/useWallets";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { type ChainUniqueId } from "core/types/ChainUniqueId";

export const usePrivateKey = (uniqueId: ChainUniqueId, coinType: CoinType) => {
  const [privateKey, setPrivateKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { popupServerClient } = useClient();
  const { selectedWallet } = useCurrWallet();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();

  const selectedAccount = useMemo(() => {
    const res = getMatchAccountsWithUniqueId(uniqueId);
    console.log("      22222222 ");
    console.log(res);

    return res[0]; // for test
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await popupServerClient.getPrivateKey({
          walletId: selectedAccount.wallet.walletId,
          accountId: selectedAccount.account.accountId,
          coinType,
        });

        setPrivateKey(res);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch privateKey"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [popupServerClient, coinType, selectedWallet, selectedAccount]);

  return { privateKey, loadingPrivateKey: loading, error };
};
