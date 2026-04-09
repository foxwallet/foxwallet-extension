import type { QtumConfig } from "../../types/QtumConfig";
import { providers } from "ethers";

export const createQtumRpcProviders = (
  config: QtumConfig,
): providers.JsonRpcProvider[] => {
  return config.rpcList.map((url) => new providers.JsonRpcProvider(url));
};
