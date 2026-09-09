import mitt, { Emitter } from "mitt";
import type { ContentServerMethod } from "../background/servers/IWalletServer";
import type { EmitData, ProviderMetadata } from "./type";
import type { CoinType } from "core/types";
import { getWebsiteMessenger } from "@/messaging/injectorToContent";
import { isContentMethod } from "@/messaging/contentMethods";
import { ProviderError } from "./ErrorCode";

export class BaseProvider {
  #isFoxWallet: boolean;
  #events: Emitter<any>;
  readonly chain: CoinType;
  #messenger: ReturnType<typeof getWebsiteMessenger>;

  constructor(coinType: CoinType) {
    this.chain = coinType;
    this.#isFoxWallet = true;
    this.#events = mitt();
    this.emit = this.emit.bind(this);
    this.#messenger = getWebsiteMessenger(coinType);
    this.#messenger.onMessage("emit", ({ data }) => {
      if (data?.type === "EmitData" && data.coinType === this.chain) {
        this.onDappEmit({ detail: data });
      }
    });
  }

  onDappEmit(event: { detail: EmitData }) {}

  async send<T>(
    method: ContentServerMethod<CoinType>,
    payload: any,
    metadata: ProviderMetadata = {},
  ) {
    if (!isContentMethod(this.chain, method)) {
      throw new ProviderError(4200, `Unsupported method: ${method}`);
    }
    const { error, data } = await this.#messenger.sendMessage(method, {
      payload,
      metadata,
    });
    if (error) {
      throw error;
    }
    return data as T | undefined;
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

  emit(event: string, params: any) {
    this.#events.emit(event, params);
  }
}
