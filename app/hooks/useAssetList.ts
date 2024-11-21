import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useInteractiveTokens } from "./useToken";
import { isEqual } from "lodash";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";

export const useAssetList = (uniqueId: ChainUniqueId, address: string) => {
  const inited = usePopupSelector(
    (state) =>
      state.tokens.hasInitTokensByInteractiveTokens[uniqueId]?.[address],
  );
  const userTokens = usePopupSelector((state) => {
    return state.tokens.userTokens[uniqueId]?.[address] ?? [];
  }, isEqual);
  const dispatch = usePopupDispatch();
  const { loadingInteractiveTokens, getInteractiveTokens } =
    useInteractiveTokens(uniqueId, address, false);

  useEffect(() => {
    if (!inited) {
      const initTokens = async () => {
        const tokens = await getInteractiveTokens();
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
  }, [inited, getInteractiveTokens]);

  const assets = useMemo(() => {
    return [ALEO_NATIVE_TOKEN, ...userTokens];
  }, [userTokens]);

  return { assets, nativeToken: ALEO_NATIVE_TOKEN };
};
