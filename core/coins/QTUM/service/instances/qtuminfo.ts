import type { QtumConfig } from "../../types/QtumConfig";
import { QtumInfoApi } from "../api/qtuminfoapi";

export const createQtumInfoServices = (config: QtumConfig): QtumInfoApi[] => {
  return config.qtumInfoApiList.map((url) => new QtumInfoApi(url));
};
