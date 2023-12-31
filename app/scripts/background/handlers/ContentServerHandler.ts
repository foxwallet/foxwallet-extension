import { type Runtime } from "webextension-polyfill";
import { type IHandler } from "../../../common/utils/connection";
import {
  type ServerMessage,
  MessageType,
  type ServerPayload,
} from "../../../common/types/message";
import { logger } from "../../../common/utils/logger";
import {
  type ContentWalletServer,
  contentWalletServer,
} from "../servers/ContentServer";
import { PortName } from "../../../common/types/port";
import { executeServerMethod } from "../servers/IWalletServer";

export class ContentServerHandler implements IHandler {
  contentServer: ContentWalletServer;

  constructor() {
    this.contentServer = contentWalletServer;
  }

  wrapContentResp(rawResp: ServerPayload, id: number) {
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
      if (origin !== PortName.CONTENT_TO_BACKGROUND) {
        logger.error("ContentServerHandler Invalid origin ", msg.origin);
        return;
      }
      const resp = this.wrapContentResp(
        await executeServerMethod(this.contentServer[method](payload)),
        id,
      );
      port.postMessage(resp);
    });
  }
}

export const contentServerHandler = new ContentServerHandler();
