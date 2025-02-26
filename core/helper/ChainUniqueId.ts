import {
  type EthCustomRPCUniqueId,
  EthRpcPrefix,
} from "core/types/ChainUniqueId";

export const formatCustomEthRpcUniqueId = (
  chainId: number | string,
): EthCustomRPCUniqueId => {
  return `${EthRpcPrefix}${chainId}` as EthCustomRPCUniqueId;
};
