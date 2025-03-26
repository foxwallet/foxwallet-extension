import { type Runtime } from "webextension-polyfill";
import { type IHandler } from "../../../common/utils/connection";
import {
  type ServerMessage,
  MessageType,
  type ServerPayload,
} from "../../../common/types/message";
import { logger } from "../../../common/utils/logger";
import { type ContentWalletServer } from "../servers/ContentServer";
import { PortName } from "../../../common/types/port";
import { executeServerMethod } from "../servers/IWalletServer";
import {EmitData} from "@/scripts/content/type";

export class ContentServerHandler implements IHandler {
  contentServer: ContentWalletServer;
  pagePorts: Runtime.Port[] = [];

  constructor(contentWalletServer: ContentWalletServer) {
    this.contentServer = contentWalletServer;
  }

  wrapContentResp(rawResp: ServerPayload, id: string) {
    return {
      id,
      payload: rawResp,
    };
  }

  handle(port: Runtime.Port): void | Promise<void> {
    if (!this.pagePorts.includes(port)) {
      this.pagePorts.push(port);
    } else {
      console.log("ContentServerHandler do get duplicate port");
    }
    port.onMessage.addListener(async (msg: ServerMessage) => {
      if (msg.type !== MessageType.REQUEST) {
        return;
      }
      if (msg.origin !== PortName.CONTENT_TO_BACKGROUND) {
        logger.error("ContentServerHandler Invalid origin ", msg.origin);
        return;
      }
      console.log("ContentServerHandler msg", msg);
      const { id, method, coinType, payload, origin, siteMetadata } = msg;
      const resp = this.wrapContentResp(
        await executeServerMethod(
          this.contentServer.execute({
            method,
            payload,
            siteMetadata,
            coinType,
          }) as any,
        ),
        id,
      );
      port.postMessage(resp);
    });
    port.onDisconnect.addListener((port)=>{
      this.pagePorts = this.pagePorts.filter(lPort => lPort === port);
    })
  }

  emitToDapps(message: EmitData) {
    console.log("ContentServerHandler emitToDapps", this.pagePorts);
    this.pagePorts.forEach((port) => {
      try {
        port.postMessage(message);
      } catch (e) {
        console.log("ContentServerHandler", e);
      }
    })
  }
}
