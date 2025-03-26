import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type NativeTokenWithAddress } from "core/types/Token";

export type AleoConfig = ChainBaseConfig & {
  chainId: string;
  syncApiList: string[];
  walletApiList: string[];
  alphaSwapApi?: string;
  arcaneApi?: string;
  nativeCurrency: NativeTokenWithAddress;
  aleoInfoApi: string;
};
