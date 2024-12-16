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

  const inited = usePopupSelector((state) => {
    console.log("      state.tokens");
    console.log({ ...state.tokens });
    return state.tokens.hasInitTokensByInteractiveTokens[uniqueId]?.[address];
  });
  const userTokens = usePopupSelector((state) => {
    return state.tokens.userTokens[uniqueId]?.[address] ?? [];
  }, isEqual);
  const dispatch = usePopupDispatch();
  const { loadingInteractiveTokens, getUserInteractiveTokens } =
    useInteractiveTokens(uniqueId, address, false);

  useEffect(() => {
    console.log("      inited " + inited);
    if (!inited) {
      const initTokens = async () => {
        const tokens = await getUserInteractiveTokens();
        if (tokens) {
          dispatch.tokens.initAddressTokens({
            uniqueId,
            address,
            tokens,
          });
          dispatch.tokens.changeHasInitTokensByInteractiveTokensState({
            uniqueId,
            address,
            newInitState: true,
          });
        }
      };
      void initTokens();
    }
  }, [inited, getUserInteractiveTokens, dispatch.tokens, uniqueId, address]);

  const assets = useMemo(() => {
    return [ALEO_NATIVE_TOKEN, ...userTokens];
  }, [userTokens]);

  // debugger;
  return { assets, nativeToken: ALEO_NATIVE_TOKEN };
};
