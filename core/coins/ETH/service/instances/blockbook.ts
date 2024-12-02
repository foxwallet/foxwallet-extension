import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";
import { BlockbookApi } from "../api/blockbook";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";

export type BlockBookService = AutoSwitchProxy<string, BlockbookApi>;

export const createEthBlockBookService = (config: ETHConfig) => {
  const { blockbookApiList } = config;
  return createAutoSwitchApi(
    blockbookApiList ?? [],
    (url) => new BlockbookApi(url, config.uniqueId),
  );
};
