import type { QtumConfig } from "../../types/QtumConfig";
import { BlockbookApi } from "../api/blockbook";
import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";

export type BlockbookService = AutoSwitchProxy<string, BlockbookApi>;

export const createBlockbookService = (
  config: QtumConfig,
): BlockbookService | undefined => {
  if (!config.blockbookApiList || config.blockbookApiList.length === 0) {
    return undefined;
  }
  return createAutoSwitchApi(
    config.blockbookApiList,
    (url) => new BlockbookApi(url),
  );
};
