import { ChainAssembleMode } from "core/types/ChainUniqueId";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { currSelectedChainsSelector } from "@/store/selectors/account";
import { isEqual } from "lodash";
import { type ChainDisplayData } from "@/components/Wallet/ChangeNetworkDrawer";
import { useGroupAccountChainList } from "@/hooks/useChainList";
import { useCurrWallet } from "@/hooks/useWallets";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";

export const useUserSelectedChains = () => {
  const selectedUniqueIds = useSelector((state: RootState) => {
    return currSelectedChainsSelector(state);
  }, isEqual);
  const chains = useGroupAccountChainList();

  const wallet = useCurrWallet();
  const isSimpleWallet = useMemo(() => {
    return wallet.selectedWallet?.walletType === WalletType.SIMPLE;
  }, [wallet]);

  const selectedChains: ChainDisplayData[] = useMemo(() => {
    if (isSimpleWallet) {
      const res = chains.map((item) => {
        return {
          mode: ChainAssembleMode.SINGLE,
          ...item,
        };
      });
      return [{ mode: ChainAssembleMode.ALL }, ...res];
    } else {
      const res: ChainDisplayData[] = [];
      chains.forEach((item) => {
        if (selectedUniqueIds.includes(item.uniqueId)) {
          res.push({
            mode: ChainAssembleMode.SINGLE,
            ...item,
          });
        }
      });
      return [{ mode: ChainAssembleMode.ALL }, ...res];
    }
  }, [chains, isSimpleWallet, selectedUniqueIds]);

  return { selectedUniqueIds, selectedChains };
};
