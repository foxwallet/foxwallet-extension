import { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { NativeToken, NativeTokenWithAddress } from "core/types/Token";

export type AleoConfig = ChainBaseConfig & {
  chainId: string;
  syncApiList: string[];
  walletApiList: string[];
  alphaSwapApi?: string;
  nativeCurrency: NativeTokenWithAddress;
};
