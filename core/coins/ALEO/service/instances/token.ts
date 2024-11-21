import {
  type AutoSwitchProxy,
  createAutoSwitchApi,
} from "../../../../utils/retry";
import { TokenApi } from "../api/token";

interface Config {
  url: string;
  chainId: string;
}

export type AlphaSwapTokenService = AutoSwitchProxy<Config, TokenApi>;

export const createAlphaSwapTokenService = (config: Config[]) => {
  return createAutoSwitchApi(
    config,
    ({ url, chainId }) => new TokenApi({ host: url, chainId }),
  );
};
