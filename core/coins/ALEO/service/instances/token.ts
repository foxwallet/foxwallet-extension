import { AutoSwitchService } from "../../../../utils/retry";
import { TokenApi } from "../api/token";

interface Config {
  url: string;
  chainId: string;
}

export class TokenService extends AutoSwitchService<Config, TokenApi> {
  getInstanceList(config: Config[]): TokenApi[] {
    return config.map(({ url, chainId }) => {
      return new TokenApi({ host: url, chainId });
    });
  }
}
