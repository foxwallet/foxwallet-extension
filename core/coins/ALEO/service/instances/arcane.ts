import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";
import { ArcaneApi } from "../api/arcane";

interface Config {
  url: string;
  chainId: string;
}

export type ArcaneService = AutoSwitchProxy<Config, ArcaneApi>;

export const createArcaneService = (config: Config[]) => {
  return createAutoSwitchApi(
    config,
    ({ url, chainId }) => new ArcaneApi({ host: url, chainId }),
  );
};
