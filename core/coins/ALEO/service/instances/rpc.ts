import { AutoSwitchService } from "@/common/utils/retry";
import { AleoRpc } from "../api/rpc";

export class AleoRpcService extends AutoSwitchService<string, AleoRpc> {
  getInstanceList(requestUrls: string[]): AleoRpc[] {
    return requestUrls.map((rpcUrl) => {
      return new AleoRpc(rpcUrl);
    });
  }
}
