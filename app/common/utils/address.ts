import { CoinType } from "core/types";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { store } from "@/store/store";
import { allChainConfigsSelector } from "@/store/selectors/account";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";

export const matchAddressSupportedUniqueIds = (
  address: string,
  targetChainConfigs?: ChainBaseConfig[],
) => {
  if (!address) {
    return {
      valid: false,
      supportChains: [],
      isEVMAddress: false,
    };
  }
  const chainConfigs =
    targetChainConfigs ?? allChainConfigsSelector(store.getState());
  const supportChains: ChainBaseConfig[] = [];
  let isEVMAddress = false;

  Object.values(CoinType).forEach((coinType) => {
    const valid = coinServiceEntry
      .getInstance(DEFAULT_CHAIN_UNIQUE_ID[coinType])
      .validateAddress(address);
    if (valid) {
      if (coinType === CoinType.ETH) {
        isEVMAddress = true; // 只要一个命中，即认为是EVM地址
      }
      supportChains.push(
        ...chainConfigs.filter((config) => config.coinType === coinType),
      );
    }
  });
  return {
    supportChains,
    isEVMAddress,
    valid: supportChains.length > 0,
  };
};
