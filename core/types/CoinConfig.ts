import { type ChainUniqueId } from "./ChainUniqueId";
import { type CoinType } from "./CoinType";
import { type ExplorerLanguages } from "./ExplorerLanguages";
import { type NativeToken } from "./Token";

export interface CoinConfig {
  coinType: CoinType;
  uniqueId: ChainUniqueId;
  logo?: TexImageSource;
  chainName: string;
  nativeCurrency: NativeToken;
  rpcList: string[];
  explorerUrls?: {
    [ExplorerLanguages.EN]: string;
    [ExplorerLanguages.ZH]: string;
  };
  explorerPaths?: {
    tx: string;
    address?: string;
    token?: string;
  };
  testnet?: boolean;
  faucetWebList?: string[];
  faucetApi?: string;
  innerFaucet?: boolean;
}
