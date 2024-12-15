import { ChainAssembleMode } from "core/types/ChainUniqueId";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { currSelectedChainsSelector } from "@/store/selectors/account";
import { isEqual } from "lodash";
import { type ChainDisplayData } from "@/components/Wallet/ChangeNetworkDrawer";
import { useGroupAccountChainList } from "@/hooks/useChainList";

export const useUserSelectedChains = () => {
  const selectedUniqueIds = useSelector((state: RootState) => {
    return currSelectedChainsSelector(state);
  }, isEqual);

  const chains = useGroupAccountChainList();

  const selectedChains: ChainDisplayData[] = useMemo(() => {
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
  }, [chains, selectedUniqueIds]);

  return { selectedUniqueIds, selectedChains };
};
