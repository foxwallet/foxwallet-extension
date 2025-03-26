import { ChainAssembleMode } from "core/types/ChainUniqueId";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { currSelectedChainsSelector } from "@/store/selectors/account";
import { isEqual } from "lodash";
import {
  type ChainDisplayData,
  type SingleChainDisplayData,
} from "@/components/Wallet/ChangeNetworkDrawer";
import { useGroupAccountChainList } from "@/hooks/useChainList";

export const useUserSelectedChains = () => {
  const selectedUniqueIds = useSelector((state: RootState) => {
    return currSelectedChainsSelector(state);
  }, isEqual);

  const chains = useGroupAccountChainList();

  const selectedChainsWithoutAll: SingleChainDisplayData[] = useMemo(() => {
    const res: SingleChainDisplayData[] = [];
    chains.forEach((item) => {
      if (selectedUniqueIds.includes(item.uniqueId)) {
        res.push({
          mode: ChainAssembleMode.SINGLE,
          ...item,
        });
      }
    });
    return res;
  }, [chains, selectedUniqueIds]);

  const selectedChains: ChainDisplayData[] = useMemo(() => {
    return [{ mode: ChainAssembleMode.ALL }, ...selectedChainsWithoutAll];
  }, [selectedChainsWithoutAll]);

  return { selectedUniqueIds, selectedChains, selectedChainsWithoutAll };
};
