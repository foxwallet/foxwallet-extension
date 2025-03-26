import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useEffect, useMemo } from "react";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useInteractiveTokens } from "./useToken";
import { isEqual } from "lodash";
import { ALEO_NATIVE_TOKEN } from "core/coins/ALEO/config/chains";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";

export const useAssetList = (uniqueId: ChainUniqueId, address: string) => {
  const { nativeCurrency, chainConfig } = useCoinService(uniqueId);

  const needUpdate = usePopupSelector((state) => {
    const lastUpdateTimestamp =
      state.tokens?.lastUpdateTimestamp[uniqueId]?.[address];

    if (!lastUpdateTimestamp) {
      return true;
    }
    // const now = Date.now();
    // return Math.abs(now - lastUpdateTimestamp) > 1 * 60 * 1000; // 频控5分钟
  });

  const userTokens = usePopupSelector((state) => {
    return state.tokens.userTokens[uniqueId]?.[address] ?? [];
  }, isEqual);
  const dispatch = usePopupDispatch();
  const { getUserInteractiveTokens } = useInteractiveTokens(
    uniqueId,
    address,
    true,
  );

  useEffect(() => {
    if (needUpdate) {
      const updateTokens = async () => {
        const res = await getUserInteractiveTokens();
        if (res?.tokens) {
          dispatch.tokens.updateAddressTokens({
            uniqueId,
            address,
            tokens: res.tokens,
          });
          dispatch.tokens.updateTimestamp({
            uniqueId,
            address,
            newUpdateTimestamp: Date.now(),
          });
        }
      };
      void updateTokens();
    }
  }, [
    getUserInteractiveTokens,
    dispatch.tokens,
    uniqueId,
    address,
    needUpdate,
  ]);

  const nativeToken = useMemo(() => {
    const coin: TokenV2 = {
      contractAddress: "",
      decimals: nativeCurrency.decimals,
      ownerAddress: address,
      symbol: nativeCurrency.symbol,
      type: AssetType.COIN,
      uniqueId,
      icon: chainConfig.logo,
    };
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET
      ? { ...ALEO_NATIVE_TOKEN, ...coin }
      : coin;
  }, [address, chainConfig, nativeCurrency, uniqueId]);

  const assets = useMemo(() => {
    return [nativeToken, ...userTokens];
  }, [userTokens, nativeToken]);

  // debugger;
  return { assets, nativeToken };
};
