import {
  type AutoSwitchProxy,
  createAutoSwitchApi,
} from "../../../../utils/retry";
import { AleoWalletApi } from "../api/api";

interface ApiConfig {
  url: string;
  chainId: string;
}

export type AleoWalletService = AutoSwitchProxy<ApiConfig, AleoWalletApi>;

export const createAleoWalletService = (config: ApiConfig[]) => {
  return createAutoSwitchApi(
    config,
    ({ url, chainId }) => new AleoWalletApi({ host: url, chainId }),
  );
};
