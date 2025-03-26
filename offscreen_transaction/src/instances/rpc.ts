import { createAutoSwitchApi, type AutoSwitchProxy } from "../utils/retry";
import { AleoRpc } from "../api/rpc";

export type AleoRpcService = AutoSwitchProxy<string, AleoRpc>;

export const createAleoRpcService = (config: string[]) => {
  return createAutoSwitchApi(config, (url) => new AleoRpc(url));
};
