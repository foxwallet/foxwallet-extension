import { Runtime } from "webextension-polyfill";
import { IHandler } from "../../../common/utils/connection";
import { AuthManager } from "../managers/auth/AuthManager";
import { KeyringManager } from "../managers/keyring/KeyringManager";
import { WalletAssetsManager } from "../managers/assets";
import {
  ServerMessage,
  MessageType,
  WalletModule,
  ServerPayload,
} from "../../../common/types/message";
import { logger } from "../../../common/utils/logger";
import { PopupWalletServer, popupWalletServer } from "../servers/PopupServer";
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
