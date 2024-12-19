import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useMemo } from "react";
import type { TokenV2 } from "core/types/Token";
import { useLocationParams } from "@/hooks/useLocationParams";
import { useAssetList } from "@/hooks/useAssetList";

export const useSafeTokenInfo = (uniqueId: ChainUniqueId, address: string) => {
  const token = useLocationParams("token");
  const { nativeToken } = useAssetList(uniqueId, address);
  const tokenInfo = useMemo(() => {
    try {
      if (!token) {
        return nativeToken;
      }
      return JSON.parse(token) as TokenV2;
    } catch (err) {
      return nativeToken;
    }
  }, [nativeToken, token]);

  return { tokenInfo };
};
