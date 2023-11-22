import { SiteInfo } from "@/scripts/content/host";
import { DecryptPermission } from "./permission";

export interface AleoConnectHistory {
  site: SiteInfo;
  decryptPermission: DecryptPermission;
  programs?: string[];
  network: string;
  lastConnectTime: number;
  disconnected?: boolean;
}
