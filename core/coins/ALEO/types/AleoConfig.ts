import { CoinConfig } from "core/types/CoinConfig";
import { NativeToken, NativeTokenWithAddress } from "core/types/Token";

export type AleoConfig = CoinConfig & {
  chainId: string;
  syncApiList: string[];
  walletApiList: string[];
  alphaSwapApi?: string;
  nativeCurrency: NativeTokenWithAddress;
};
