import { useChainMode } from "@/hooks/useChainMode";
import { useParams } from "react-router-dom";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useMemo } from "react";

export const useSafeParams = () => {
  const { availableChainUniqueIds, availableAccounts } = useChainMode();

  const { uniqueId: paramUniqueId, address: paramAddress } = useParams<{
    uniqueId: InnerChainUniqueId;
    address: string;
  }>();
  const { uniqueId, address } = useMemo(() => {
    return {
      uniqueId: paramUniqueId ?? availableChainUniqueIds[0],
      address: paramAddress ?? availableAccounts[0].account.address,
    };
  }, [availableAccounts, availableChainUniqueIds, paramAddress, paramUniqueId]);

  return { uniqueId, address };
};
