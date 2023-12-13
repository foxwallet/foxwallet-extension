import { AutoSwitchService } from "../../../../utils/retry";
import { AleoRpc } from "../api/rpc";

interface RpcConfig {
  url: string;
  chainId: string;
}

export class AleoRpcService extends AutoSwitchService<RpcConfig, AleoRpc> {
  getInstanceList(config: RpcConfig[]): AleoRpc[] {
    return config.map(({ url, chainId }) => {
      return new AleoRpc(url, chainId);
    });
  }
}
