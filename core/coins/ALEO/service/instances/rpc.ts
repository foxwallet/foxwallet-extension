import { AutoSwitchService } from "@/common/utils/retry";
import { AleoNetworkClient } from "aleo/index";

export class AleoRpcService extends AutoSwitchService<
  string,
  AleoNetworkClient
> {
  getInstanceList(requestUrls: string[]): AleoNetworkClient[] {
    return requestUrls.map((rpcUrl) => {
      return new AleoNetworkClient(rpcUrl);
    });
  }
}
