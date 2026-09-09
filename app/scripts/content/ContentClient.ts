import {
  MessageType,
  MsgContentToBackground,
  ServerResp,
} from "@/common/types/message";
import { PortName } from "@/common/types/port";
import { IClient } from "@/common/utils/client";
import { IPort, Port } from "@/common/utils/port";
import {
  ContentServerMethod,
  SiteMetadata,
} from "../background/servers/IWalletServer";
import { nanoid } from "nanoid";
import { CoinType } from "core/types";
import { EmitData } from "@/scripts/content/type";

export type EmitRepeat = (_: EmitData) => void;

export class ContentClient implements IClient {
  private port: IPort;
  private callbackMap: Map<string, (error: Error | null, data: any) => void>;
  private emitRepeater: EmitRepeat;

  constructor(emitRepeater: EmitRepeat) {
    this.callbackMap = new Map();
    this.emitRepeater = emitRepeater;
    this._connect();
  }

  _connect(): void {
    this.port = new Port({ name: PortName.CONTENT_TO_BACKGROUND });
    this.port.onMessage.addListener(this.#onMessage.bind(this));
    this.port.onDisconnect.addListener(() => {
      console.warn("ContentClient disconnected, try to reconnect");
      this.callbackMap.forEach((callback) => {
        callback(new Error("ContentClient disconnected"), null);
      });
      this.callbackMap = new Map();
      this._connect();
    });
  }

  #onMessage(msg: ServerResp | EmitData) {
    console.log("CONTENT_TO_BACKGROUND listener on page", msg);
    if ((msg as EmitData).type === "EmitData") {
      this.emitRepeater(msg as EmitData);
      return;
    }
    const { id, payload } = msg as ServerResp;
    const callback = this.callbackMap.get(id);
    if (callback) {
      const { error, data } = payload;
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
      this.callbackMap.delete(id);
    }
  }

  async send<C extends CoinType, T>(
    method: ContentServerMethod<C>,
    payload: T,
    coinType: C,
    siteMetadata: SiteMetadata,
  ) {
    return await new Promise<{ error: Error | null; data: any }>((resolve) => {
      const id = nanoid();
      const message: MsgContentToBackground<C, T> = {
        type: MessageType.REQUEST,
        id,
        origin: PortName.CONTENT_TO_BACKGROUND,
        coinType,
        method,
        payload,
        siteMetadata,
      };
      console.log("postMessage", message);
      const callback = (error: Error | null, data: any) => {
        resolve({ error, data });
      };
      this.callbackMap.set(id, callback);
      try {
        this.port.postMessage(message);
      } catch (error) {
        this.callbackMap.delete(id);
        callback(
          error instanceof Error ? error : new Error(String(error)),
          null,
        );
      }
    });
  }
}
