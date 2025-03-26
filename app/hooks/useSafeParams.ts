import { useChainMode } from "@/hooks/useChainMode";
import { useParams } from "react-router-dom";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useMemo } from "react";
import { useGroupAccount } from "@/hooks/useGroupAccount";

export const useSafeParams = () => {
  const { availableChainUniqueIds } = useChainMode();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();

  const { uniqueId: paramUniqueId, address: paramAddress } = useParams<{
    uniqueId: InnerChainUniqueId;
    address: string;
  }>();
  const { uniqueId, address } = useMemo(() => {
    // 这里其实是有风险的, 所以uniqueId要保证必传
    const uniqueId = paramUniqueId ?? availableChainUniqueIds[0];
    const address =
      paramAddress ?? getMatchAccountsWithUniqueId(uniqueId)[0].account.address;
    return {
      uniqueId,
      address,
    };
  }, [
    availableChainUniqueIds,
    getMatchAccountsWithUniqueId,
    paramAddress,
    paramUniqueId,
  ]);

  return { uniqueId, address };
};
