import { FOX_DAPP_REQUEST, FOX_DAPP_RESP } from "@/common/constants";
import mitt, { Emitter, EventType } from "mitt";
import { nanoid } from "nanoid";
import { ContentServerMethod } from "../background/servers/IWalletServer";
import { CallbackParams, RequestParams } from "./type";

type RequestCallback = (error?: string, data?: any) => void;

export class BaseProvider {
  #isFoxWallet: boolean;
  #events: Emitter<any>;
  #callbackMap: Map<string, RequestCallback | null>;

  constructor() {
    this.#isFoxWallet = true;
    this.#events = mitt();
    this.#callbackMap = new Map();
    window.addEventListener(FOX_DAPP_RESP, this.onMessage);
  }

  onMessage = (event: CallbackParams) => {
    const { id, error, data } = event.detail;
    const callback = this.#callbackMap.get(id);
    if (callback) {
      callback(error, data);
      this.#callbackMap.delete(id);
    }
  };

  send<T>(method: ContentServerMethod, payload: any, metadata: any = {}) {
    return new Promise<T | undefined>((resolve, reject) => {
      const id = nanoid();
      const customEvent = new CustomEvent<RequestParams>(FOX_DAPP_REQUEST, {
        detail: {
          id,
          method,
          payload,
          metadata,
        },
      });
      const callback = (error?: string, data?: T) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      };
      this.#callbackMap.set(id, callback);
      window.dispatchEvent(customEvent);
    });
  }

  get isFoxWallet() {
    return this.#isFoxWallet;
  }

  on = (event: string, handler: any) => {
    this.#events.on(event, handler);
    return () => this.#events.off(event, handler);
  };

  emit = (event: string, params: any) => {
    this.#events.emit(event, params);
  };
}
