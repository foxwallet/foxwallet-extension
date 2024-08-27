import { AutoSwitchProxy, createAutoSwitchApi } from "../../../../utils/retry";
import { AleoRpc } from "../api/rpc";

export interface RpcConfig {
  url: string;
  chainId: string;
}

export type AleoRpcService = AutoSwitchProxy<RpcConfig, AleoRpc>;

export const createAleoRpcService = (config: RpcConfig[]) => {
  return createAutoSwitchApi(
    config,
    ({ url, chainId }) => new AleoRpc(url, chainId),
  );
};
