import { ChainUniqueId } from "./ChainUniqueId";
import { CoinType } from "./CoinType";
import { ExplorerLanguages } from "./ExplorerLanguages";
import { NFTConfig, NFTMarket } from "./NFTMarket";
import { NativeToken } from "./Token";

export interface CoinConfig {
  coinType: CoinType;
  uniqueId: ChainUniqueId;
  logo?: TexImageSource;
  chainId?: string;
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
  nftMarkets?: NFTMarket[];
  nft?: NFTConfig;
  testnet?: boolean;
  faucetWebList?: string[];
  faucetApi?: string;
}