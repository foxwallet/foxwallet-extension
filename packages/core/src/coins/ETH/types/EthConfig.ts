import { CoinConfig } from "../../../types/CoinConfig";
import { MinGasLimit } from "./GasLimit";

export interface EthConfig extends CoinConfig {
  chainId: string;
  blockbookApiList?: string[];
  blockscoutApiList?: string[];
  filfoxApiList?: string[];
  minGasLimits?: MinGasLimit[];
  minMaxPriorityFeePerGas?: string;
}