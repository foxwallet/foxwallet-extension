import { type ChainBaseConfig } from "core/types/ChainBaseConfig";

type MinGasLimit = {
  contract?: string;
  functionHash?: string;
  gasLimit: number;
};

export type ETHConfig = ChainBaseConfig & {
  chainId: string;
  blockbookApiList?: string[];
  blockscoutApiList?: string[];
  filfoxApi?: string;
  routescanApi?: string;
  apescanEnabled?: boolean;
  foxNFTApiEnabled?: boolean;
  minGasLimits?: MinGasLimit[];
  minMaxPriorityFeePerGas?: string;
};

export enum ContractStandard {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  FIL_FORWARDER = "FilForwarder",
  HASHKEY = "HashKey",
  QtumOfflineStaking = "QtumOfflineStaking",
}
