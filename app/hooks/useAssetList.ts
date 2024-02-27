import { ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "./useCoinService";
import { useCallback, useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useInteractiveTokens } from "./useToken";
import { isEqual } from "lodash";
import { Token } from "core/coins/ALEO/types/Token";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";

export const useAssetList = (uniqueId: ChainUniqueId, address: string) => {
  const inited = usePopupSelector(
    (state) =>
      state.tokens.hasInitTokensByInteractiveTokens[uniqueId]?.[address],
  );
  const userTokens = usePopupSelector((state) => {
    return state.tokens.userTokens[uniqueId]?.[address] ?? [];
  }, isEqual);
  const { nativeCurrency, chainConfig } = useCoinService(uniqueId);
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
      initTokens();
    }
  }, [inited, getInteractiveTokens]);

  const assets = useMemo(() => {
    const nativeToken: Token = {
      ...nativeCurrency,
      name: nativeCurrency.name || nativeCurrency.symbol,
      tokenId: "",
      logo: nativeCurrency.logo!,
      official: true,
      programId: NATIVE_TOKEN_PROGRAM_ID,
    };
    return [nativeToken, ...userTokens];
  }, [nativeCurrency, userTokens]);

  return { assets };
};
