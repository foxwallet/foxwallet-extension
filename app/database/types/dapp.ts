import { type SiteInfo } from "@/scripts/content/host";
import { type ContentServerMethod } from "@/scripts/background/servers/IWalletServer";
import { type CoinType } from "core/types";

export interface DappRequest {
  id: string;
  address: string;
  type: ContentServerMethod<CoinType>;
  coinType: CoinType;
  siteInfo: SiteInfo;
  payload: any;
}

export enum DecryptPermission {
  NoDecrypt = "NO_DECRYPT",
  UponRequest = "DECRYPT_UPON_REQUEST",
  AutoDecrypt = "AUTO_DECRYPT",
  OnChainHistory = "ON_CHAIN_HISTORY",
}

export interface AleoConnectHistory {
  address: string;
  site: SiteInfo;
  decryptPermission: DecryptPermission;
  programs?: string[];
  network: string;
  lastConnectTime: number;
  disconnected?: boolean;
}

export interface ConnectHistory {
  address: string;
  coinType: CoinType;
  site: SiteInfo;
  decryptPermission?: DecryptPermission;
  programs?: string[];
  network?: string;
  lastConnectTime: number;
  disconnected?: boolean;
}
