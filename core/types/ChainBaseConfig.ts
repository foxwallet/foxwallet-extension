import { type ChainUniqueId } from "./ChainUniqueId";
import { type AccountOption } from "./CoinBasic";
import { type CoinType } from "./CoinType";
import { type ExplorerLanguages } from "./ExplorerLanguages";
import { type NativeToken } from "./Token";
import { type SupportLanguages } from "@/locales/i18";
import { type NFTConfig } from "core/types/NFTMarket";
export type Community = {
  name: string;
  url: string;
};

export interface ChainBaseConfig {
  coinType: CoinType;
  uniqueId: ChainUniqueId;
  chainOptionFilter?: Partial<AccountOption[CoinType]>;
  logo?: string;
  chainName: string;
  chainRemark?: {
    [key in SupportLanguages]?: string;
  };
  nativeCurrency: NativeToken;
  rpcList: string[];
  explorerUrls?: {
    [ExplorerLanguages.EN]: string;
    [ExplorerLanguages.ZH]?: string;
  };
  explorerPaths?: {
    tx: string;
    address?: string;
    token?: string;
  };
  moralisEnabled?: boolean;
  nft?: NFTConfig;
  testnet?: boolean;
  faucetWebList?: string[];
  faucetApi?: string;
  innerFaucet?: boolean;
  checkApproval?: string;
  communities?: Community[];
  coingeckoPlatformId?: string;
  safeConfirmations?: number;
  autoAdd?: boolean;
  oneInch?: {
    nativeAddress: string;
  };
  sushi?: {
    nativeAddress: string;
  };
  lifi?: {
    chainId?: string;
    nativeAddress?: string;
  };
}
