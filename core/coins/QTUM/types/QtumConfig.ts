import type { ChainBaseConfig } from "core/types/ChainBaseConfig";
import type { CoinType } from "core/types/CoinType";
import type { Network } from "bitcoinjs-lib";

export interface MinGasLimit {
  contract: string;
  functionHash: string;
  gasLimit: number;
}

export interface QtumConfig extends ChainBaseConfig {
  coinType: CoinType.QTUM;
  chainId: string;
  qtumInfoApiList: string[];
  blockbookApiList?: string[];
  rpcList: string[];
  network: Network;
  minGasLimits?: MinGasLimit[];
  faucetApi?: string;
}
