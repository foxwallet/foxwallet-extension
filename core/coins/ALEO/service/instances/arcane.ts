import { AutoSwitchService } from "../../../../utils/retry";
import { ArcaneApi } from "../api/arcane";

interface Config {
  url: string;
  chainId: string;
}

export class ArcaneService extends AutoSwitchService<Config, ArcaneApi> {
  getInstanceList(config: Config[]): ArcaneApi[] {
    return config.map(({ url, chainId }) => {
      return new ArcaneApi({ host: url, chainId });
    });
  }
}
