import { type AutoSwitchProxy, createAutoSwitchApi } from "core/utils/retry";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { parseEthChainId } from "core/coins/ETH/utils";
import { ETH_CHAIN_CONFIGS } from "core/coins/ETH/config/chains";
import { CustomJsonRpcProvider } from "core/coins/ETH/utils/CustomJsonRpcProvider";

export type EthRpcService = AutoSwitchProxy<
  {
    rpcUrl: string;
    chainId: number;
    timeout?: number;
  },
  CustomJsonRpcProvider
>;

export const createEthRpcService = (config: ETHConfig) => {
  const { rpcList, uniqueId } = config;

  const { valid, chainId } = parseEthChainId(config.chainId);
  if (!valid) {
    throw new Error(
      `Invalid chainId ${config.chainId} for ${config.chainName}`,
    );
  }

  const timeout =
    uniqueId === ETH_CHAIN_CONFIGS.FILECOIN_EVM.uniqueId || rpcList.length === 1
      ? 15000
      : 10000;

  return createAutoSwitchApi(
    rpcList.map((url) => ({
      rpcUrl: url,
      chainId,
      timeout,
    })),
    (item) =>
      new CustomJsonRpcProvider(
        { url: item.rpcUrl, timeout: item.timeout ?? 5000 },
        item.chainId,
      ),
  );
};
