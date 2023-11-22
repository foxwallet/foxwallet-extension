import { AutoSwitchService } from "../../../../utils/retry";
import { AleoRpc } from "../api/rpc";
import { AleoSyncApi } from "../api/sync";

interface SyncApiConfig {
  url: string;
  chainId: string;
}

export class AleoApiService extends AutoSwitchService<
  SyncApiConfig,
  AleoSyncApi
> {
  getInstanceList(config: SyncApiConfig[]): AleoSyncApi[] {
    return config.map(({ url, chainId }) => {
      return new AleoSyncApi({ host: url, chainId });
    });
  }
}
