import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useInteractiveTokens } from "./useToken";
import { isEqual } from "lodash";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { type Token } from "core/coins/ALEO/types/Token";
import { TokenV2 } from "core/types/Token";

export const useAssetList = (uniqueId: ChainUniqueId, address: string) => {
  console.log("      11111111");
  console.log(uniqueId);
  console.log(address);

  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();

  const needUpdate = usePopupSelector((state) => {
    const lastUpdateTimestamp =
      state.tokens?.lastUpdateTimestamp[uniqueId]?.[address];

    if (!lastUpdateTimestamp) {
      return true;
    }
    const now = Date.now();
    return Math.abs(now - lastUpdateTimestamp) > 1 * 60 * 1000;
  });

  const userTokens = usePopupSelector((state) => {
    return state.tokens.userTokens[uniqueId]?.[address] ?? [];
  }, isEqual);
  const dispatch = usePopupDispatch();
  const { loadingInteractiveTokens, getUserInteractiveTokens } =
    useInteractiveTokens(uniqueId, address, false);

  console.log("      555 userTokens");
  console.log({ ...userTokens });

  useEffect(() => {
    if (needUpdate) {
      const initTokens = async () => {
        const tokens = await getUserInteractiveTokens();

        if (tokens) {
          dispatch.tokens.updateAddressTokens({
            uniqueId,
            address,
            tokens,
          });
          dispatch.tokens.updateTimestamp({
            uniqueId,
            address,
            newUpdateTimestamp: Date.now(),
          });
        }
      };
      void initTokens();
    }
  }, [
    getUserInteractiveTokens,
    dispatch.tokens,
    uniqueId,
    address,
    needUpdate,
  ]);

  const assets = useMemo(() => {
    return [ALEO_NATIVE_TOKEN, ...userTokens];
  }, [userTokens]);

  // debugger;
  return { assets, nativeToken: ALEO_NATIVE_TOKEN };
};
