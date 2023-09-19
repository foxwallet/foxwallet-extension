import { type Runtime } from "webextension-polyfill";
import { type IHandler } from "../../../common/utils/connection";
import {
  type ServerMessage,
  MessageType,
  WalletModule,
  type ServerPayload,
} from "../../../common/types/message";
import { logger } from "../../../common/utils/logger";
import {
  type PopupWalletServer,
  popupWalletServer,
} from "../servers/PopupServer";
import {
  ContentWalletServer,
  contentWalletServer,
} from "../servers/ContentServer";
import { PortName } from "../../../common/types/port";
import { executeServerMethod } from "../servers/IWalletServer";

export class PopupServerHandler implements IHandler {
  popupServer: PopupWalletServer;

  constructor() {
    this.popupServer = popupWalletServer;
  }

  wrapPopupResp(rawResp: ServerPayload, id: number) {
    return {
      id,
      payload: rawResp,
    };
  }

  handle(port: Runtime.Port): void | Promise<void> {
    port.onMessage.addListener(async (msg: ServerMessage) => {
      if (msg.type !== MessageType.REQUEST) {
        return;
      }
      const { id, method, payload, origin } = msg;
      if (origin !== PortName.POPUP_TO_BACKGROUND) {
        logger.error("PopupServerHandler Invalid origin ", msg.origin);
        return;
      }
      const resp = this.wrapPopupResp(
        await executeServerMethod(this.popupServer[method](payload)),
        id
      );
      port.postMessage(resp);
    });
  }
}

export const popupServerHandler = new PopupServerHandler();
