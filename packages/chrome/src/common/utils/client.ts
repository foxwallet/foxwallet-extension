import { type IPopupServer } from "../../scripts/background/servers/IWalletServer";
import { KEEP_ALIVE_INTERVAL } from "../constants";
import {
  MessageType,
  PopupServerMethod,
  type ServerMessage,
  ServerPayload,
  type ServerResp,
} from "../types/message";
import { PortName } from "../types/port";
import { logger } from "./logger";
import { type IPort, Port } from "./port";

export interface IClient {
  _connect: () => void;
}

// client to connect background client
export class KeepAliveClient implements IClient {
  private port: IPort;
  private timer?: number;

  constructor(private readonly portName: PortName) {
    this._connect();
  }

  _connect(): void {
    this.port = new Port({ name: PortName.KEEP_ALIVE });
    this.port.onDisconnect.addListener(() => {
      // reconnect
      this._connect();
    });
    this.#report();
  }

  #report() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    // @ts-expect-error timeout return
    this.timer = setTimeout(() => {
      try {
        this.port.postMessage({
          type: MessageType.KEEP_ALIVE,
          origin: this.portName,
          payload: {
            portName: PortName.KEEP_ALIVE,
          },
        });
      } catch (err) {
        logger.error("Send keep alive message failed");
      }
      this.#report();
    }, KEEP_ALIVE_INTERVAL);
  }
}

export class PopupServerClient implements IClient, IPopupServer {
  private port: IPort;
  private callbackMap: Map<number, (error: Error | null, data: any) => void>;

  constructor() {
    this.callbackMap = new Map();
    this._connect();
  }

  _connect(): void {
    this.port = new Port({ name: PortName.POPUP_TO_BACKGROUND });
    this.port.onMessage.addListener(this.#onMessage.bind(this));
    this.port.onDisconnect.addListener(() => {
      logger.warn("PopupServerClient disconnected, try to reconnect");
      Object.values(this.callbackMap).forEach((callback) => {
        callback(new Error("PopupServerClient disconncected"));
      });
      this.callbackMap = new Map();
      this._connect();
    });
  }

  #onMessage(msg: ServerResp) {
    const { id, payload } = msg;
    const callback = this.callbackMap.get(id);
    if (callback) {
      const { error, data } = payload;
      if (error) {
        callback(new Error(error), null);
      } else {
        callback(null, data);
      }
      this.callbackMap.delete(id);
    }
  }

  async #send<T, R>(method: PopupServerMethod, payload: T): Promise<R> {
    return await new Promise((resolve, reject) => {
      const id = Date.now();
      const message: ServerMessage = {
        type: MessageType.REQUEST,
        id,
        origin: PortName.POPUP_TO_BACKGROUND,
        method,
        payload,
      };
      const callback = (error: Error | null, data: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      };
      this.callbackMap.set(id, callback);
      this.port.postMessage(message);
    });
  }

  async initPassword(params: { password: string }): Promise<string> {
    return await this.#send<typeof params, string>(
      PopupServerMethod.INIT_PASSWORD,
      params
    );
  }
}
