import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";
import { BlockscoutApi } from "../api/blockscout";
import { BlockscoutApiV2 } from "../api/blockscoutV2";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";

export type BlockScoutService = AutoSwitchProxy<
  string,
  BlockscoutApi | BlockscoutApiV2
>;

export const createEthBlockScoutService = (config: ETHConfig) => {
  const { blockscoutApiList, uniqueId } = config;
  return createAutoSwitchApi(blockscoutApiList ?? [], (url) => {
    if (url.endsWith("/v2")) {
      return new BlockscoutApiV2(url, uniqueId);
    }
    return new BlockscoutApi(url, uniqueId);
  });
};
