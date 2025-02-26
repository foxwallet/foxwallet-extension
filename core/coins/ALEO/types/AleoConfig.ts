import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type NativeTokenWithAddress } from "core/types/Token";

export type AleoConfig = ChainBaseConfig & {
  chainId: string;
  syncApiList: string[];
  walletApiList: string[];
  alphaSwapApi?: string;
  nativeCurrency: NativeTokenWithAddress;
  aleoInfoApi: string;
};
