import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  type PopupServerMethod,
  type IPopupServer,
  type CreateWalletProps,
  type RegenerateWalletProps,
  type ImportHDWalletProps,
  type AddAccountProps,
  type AleoSendTxProps,
  type GetSelectedAccountProps,
  type SetSelectedAccountProps,
  type RequestFinfishProps,
  type GetSelectedUniqueIdProps,
  type SetSelectedUniqueIdProps,
  ResyncAleoProps,
  type ImportPrivateKeyProps,
  type GetPrivateKeyProps,
  type ChangeAccountStateProps,
  type PopupSignMessageProps,
} from "../../scripts/background/servers/IWalletServer";
import {
  type DisplayWallet,
  type DisplayKeyring,
  type OneMatchGroupAccount,
} from "../../scripts/background/store/vault/types/keyring";
import { KEEP_ALIVE_INTERVAL } from "../constants";
import {
  MessageType,
  type ServerMessage,
  ServerPayload,
  type ServerResp,
} from "../types/message";
import { PortName } from "../types/port";
import { logger } from "./logger";
import { type IPort, Port } from "./port";
import { nanoid } from "nanoid";
import { type CoinType } from "core/types";

export interface IClient {
  _connect: () => void;
}

// client to connect background client
export class KeepAliveClient implements IClient {
  private port: IPort;
  private timer?: number;

  constructor(private readonly origin: PortName) {
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
          origin: this.origin,
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
  private callbackMap: Map<string, (error: Error | null, data: any) => void>;

  constructor() {
    this.callbackMap = new Map();
    this._connect();
  }

  _connect(): void {
    this.port = new Port({ name: PortName.POPUP_TO_BACKGROUND });
    this.port.onMessage.addListener(this.#onMessage.bind(this));
    this.port.onDisconnect.addListener((...args) => {
      logger.warn(
        "PopupServerClient disconnected, try to reconnect ",
        " args: ",
        args,
      );
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
        callback(new Error(error?.message ?? error), null);
      } else {
        callback(null, data);
      }
      this.callbackMap.delete(id);
    }
  }

  async initPassword(params: { password: string }): Promise<boolean> {
    return await this.#send("initPassword", params);
  }

  async hasAuth(): Promise<boolean> {
    return await this.#send("hasAuth", {});
  }

  async login(params: { password: string }): Promise<boolean> {
    return await this.#send("login", params);
  }

  async lock(): Promise<void> {
    await this.#send("lock", {});
  }

  async timeoutLock(): Promise<void> {
    await this.#send("timeoutLock", {});
  }

  async createWallet(params: CreateWalletProps): Promise<DisplayWallet> {
    return await this.#send("createWallet", params);
  }

  async regenerateWallet(
    params: RegenerateWalletProps,
  ): Promise<DisplayWallet> {
    return await this.#send("regenerateWallet", params);
  }

  async importHDWallet(params: ImportHDWalletProps): Promise<DisplayWallet> {
    return await this.#send("importHDWallet", params);
  }

  async addAccount(params: AddAccountProps): Promise<DisplayWallet> {
    return await this.#send("addAccount", params);
  }

  async importPrivateKey<T extends CoinType>(
    params: ImportPrivateKeyProps<T>,
  ): Promise<DisplayWallet> {
    return await this.#send("importPrivateKey", params);
  }

  async getSelectedGroupAccount(
    params?: GetSelectedAccountProps | undefined,
  ): Promise<OneMatchGroupAccount | null> {
    return await this.#send("getSelectedGroupAccount", params);
  }

  async setSelectedGroupAccount({
    groupAccount,
  }: SetSelectedAccountProps): Promise<OneMatchGroupAccount> {
    return await this.#send("setSelectedGroupAccount", { groupAccount });
  }

  async getHDWallet(walletId: string): Promise<DisplayWallet> {
    return await this.#send("getHDWallet", walletId);
  }

  async getSimpleWallet(walletId: string): Promise<DisplayWallet> {
    return await this.#send("getSimpleWallet", walletId);
  }

  async getAllWallet(): Promise<DisplayKeyring> {
    return await this.#send("getAllWallet", {});
  }

  async rescanAleo(): Promise<boolean> {
    return await this.#send("rescanAleo", {});
  }

  async resetChain(): Promise<boolean> {
    return await this.#send("resetChain", {});
  }

  async sendAleoTransaction(params: AleoSendTxProps): Promise<void> {
    await this.#send("sendAleoTransaction", params);
  }

  async isSendingAleoTransaction(): Promise<boolean> {
    return await this.#send("isSendingAleoTransaction", {});
  }

  async signMessage(params: PopupSignMessageProps): Promise<string> {
    return await this.#send("signMessage", params);
  }

  async onRequestFinish(params: RequestFinfishProps): Promise<void> {
    await this.#send("onRequestFinish", params);
  }

  async getHDMnemonic(walletId: string): Promise<string> {
    return await this.#send("getHDMnemonic", walletId);
  }

  async deleteWallet(walletId: string): Promise<DisplayKeyring> {
    return await this.#send("deleteWallet", walletId);
  }

  async getPrivateKey(params: GetPrivateKeyProps): Promise<string> {
    return await this.#send("getPrivateKey", params);
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this.#send("checkPassword", password);
  }

  async #send<T, R>(method: PopupServerMethod, payload: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const id = nanoid();
      const message: ServerMessage = {
        type: MessageType.REQUEST,
        id,
        origin: PortName.POPUP_TO_BACKGROUND,
        method,
        payload,
      };
      const callback = (error: Error | null, data: any) => {
        if (error) {
          logger.error("PopupServerClient ", error);
          reject(error);
        } else {
          resolve(data);
        }
      };
      this.callbackMap.set(id, callback);
      this.port.postMessage(message);
    });
  }
}
