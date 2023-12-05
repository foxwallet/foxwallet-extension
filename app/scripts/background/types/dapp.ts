import { SiteInfo } from "@/scripts/content/host";
import { ContentServerMethod } from "../servers/IWalletServer";
import { CoinType } from "core/types";

export interface DappRequest {
  id: string;
  type: ContentServerMethod;
  coinType: CoinType;
  siteInfo: SiteInfo;
  payload: any;
}
