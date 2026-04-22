import type { QtumConfig } from "../../types/QtumConfig";
import { QtumInfoApi } from "../api/qtuminfoapi";
import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";

export type QtumInfoService = AutoSwitchProxy<string, QtumInfoApi>;

export const createQtumInfoService = (config: QtumConfig): QtumInfoService => {
  return createAutoSwitchApi(
    config.qtumInfoApiList,
    (url) => new QtumInfoApi(url),
  );
};
