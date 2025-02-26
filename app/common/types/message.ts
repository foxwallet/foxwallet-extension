import { SiteInfo } from "@/scripts/content/host";
import {
  type SiteMetadata,
  type ContentServerMethod,
  type PopupServerMethod,
} from "../../scripts/background/servers/IWalletServer";
import { type PortName } from "./port";
import { type CoinType } from "core/types";

export enum MessageType {
  KEEP_ALIVE = "keep_alive",
  REQUEST = "request",
}

export enum WalletModule {
  AUTH = "auth",
  KEYRING = "keyring",
  ASSETS = "assets",
}

export type MsgContentToBackground<C extends CoinType, T = any> = {
  type: MessageType.REQUEST;
  id: string;
  coinType: C;
  origin: PortName.CONTENT_TO_BACKGROUND;
  method: ContentServerMethod<C>;
  payload: T;
  siteMetadata: SiteMetadata;
};
export type MsgPopupToBackground<T = any> = {
  type: MessageType.REQUEST;
  id: string;
  origin: PortName.POPUP_TO_BACKGROUND;
  method: PopupServerMethod;
  payload: T;
};
export type ServerMessage<T = any> =
  | {
      type: MessageType.KEEP_ALIVE;
      origin: PortName;
      payload: T;
    }
  | MsgPopupToBackground<T>
  | MsgContentToBackground<CoinType, T>;

export interface ServerPayload<T = any> {
  error: null | string;
  data: T | null;
}

export interface ServerResp<T = any> {
  id: string;
  payload: ServerPayload<T>;
}
