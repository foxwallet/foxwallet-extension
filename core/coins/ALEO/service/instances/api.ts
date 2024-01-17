import { AutoSwitchService } from "../../../../utils/retry";
import { AleoWalletApi } from "../api/api";

interface ApiConfig {
  url: string;
  chainId: string;
}

export class AleoWalletService extends AutoSwitchService<
  ApiConfig,
  AleoWalletApi
> {
  getInstanceList(config: ApiConfig[]): AleoWalletApi[] {
    return config.map(({ url, chainId }) => {
      return new AleoWalletApi({ host: url, chainId });
    });
  }
}
