import { SiteInfo } from "@/scripts/content/host";
import {
  type SiteMetadata,
  type ContentServerMethod,
  type PopupServerMethod,
} from "../../scripts/background/servers/IWalletServer";
import { type PortName } from "./port";

export enum MessageType {
  KEEP_ALIVE = "keep_alive",
  REQUEST = "request",
}

export enum WalletModule {
  AUTH = "auth",
  KEYRING = "keyring",
  ASSETS = "assets",
}

export type ServerMessage<T = any> =
  | {
      type: MessageType.KEEP_ALIVE;
      origin: PortName;
      payload: T;
    }
  | {
      type: MessageType.REQUEST;
      id: string;
      origin: PortName.POPUP_TO_BACKGROUND;
      method: PopupServerMethod;
      payload: T;
    }
  | {
      type: MessageType.REQUEST;
      id: string;
      origin: PortName.CONTENT_TO_BACKGROUND;
      method: ContentServerMethod;
      payload: T;
      siteMetadata: SiteMetadata;
    };

export interface ServerPayload<T = any> {
  error: null | string;
  data: T | null;
}

export interface ServerResp<T = any> {
  id: string;
  payload: ServerPayload<T>;
}
