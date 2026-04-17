import type { QtumConfig } from "../../types/QtumConfig";
import { BlockbookApi } from "../api/blockbook";

export const createBlockbookServices = (config: QtumConfig): BlockbookApi[] => {
  if (!config.blockbookApiList || config.blockbookApiList.length === 0) {
    return [];
  }
  return config.blockbookApiList.map((url) => new BlockbookApi(url));
};
