import {
  FOX_DAPP_EMIT,
  FOX_DAPP_REQUEST,
  FOX_DAPP_RESP,
} from "@/common/constants";
import mitt, { Emitter } from "mitt";
import { nanoid } from "nanoid";
import { ContentServerMethod } from "../background/servers/IWalletServer";
import { CallbackParams, EmitData, RequestParams } from "./type";
import { CoinType } from "core/types";

type RequestCallback = (error?: string, data?: any) => void;

export class BaseProvider {
  #isFoxWallet: boolean;
  #events: Emitter<any>;
  #callbackMap: Map<string, RequestCallback | null>;
  chain: CoinType; // coin type

  constructor() {
    this.#isFoxWallet = true;
    this.#events = mitt();
    this.#callbackMap = new Map();
    this.emit = this.emit.bind(this);
    window.addEventListener(FOX_DAPP_RESP, this.onMessage);
    this.onDappEmit = this.onDappEmit.bind(this);
    window.addEventListener(FOX_DAPP_EMIT, this.onDappEmit);
  }

  onMessage = (event: CallbackParams) => {
    const { id, error, data } = event.detail;
    const callback = this.#callbackMap.get(id);
    if (callback) {
      callback(error, data);
      this.#callbackMap.delete(id);
    }
  };

  onDappEmit(event: { detail: EmitData }) {
  }

  send<T>(
    method: ContentServerMethod<CoinType>,
    payload: any,
    metadata: any = {},
  ) {
    return new Promise<T | undefined>((resolve, reject) => {
      const id = nanoid();
      const customEvent = new CustomEvent<RequestParams<CoinType>>(
        FOX_DAPP_REQUEST,
        {
          detail: {
            id,
            coinType: this.chain,
            method,
            payload,
            metadata,
          },
        },
      );
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

  removeListener = (event: string, handler: any) => {
    this.#events.off(event, handler);
  };

  off = (event: string, handler: any) => {
    this.#events.off(event, handler);
  };

  removeAllListeners = () => {
    this.#events.all.clear();
  };

  emit(event: string, params: any)  {
    this.#events.emit(event, params);
  };
}
