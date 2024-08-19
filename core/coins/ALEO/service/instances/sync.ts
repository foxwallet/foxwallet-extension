import { AutoSwitchProxy, createAutoSwitchApi } from "../../../../utils/retry";
import { AleoSyncApi } from "../api/sync";

interface SyncApiConfig {
  url: string;
  chainId: string;
}

export type AleoApiService = AutoSwitchProxy<SyncApiConfig, AleoSyncApi>;

export const createAleoApiService = (config: SyncApiConfig[]) => {
  return createAutoSwitchApi(
    config,
    ({ url, chainId }) => new AleoSyncApi({ host: url, chainId }),
  );
};
