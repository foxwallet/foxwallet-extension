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
  type ScannerDeactivateViewConsumerProps,
  type ScannerGetDecryptedOwnedRecordsProps,
  type ScannerRegisterProps,
  type ScannerRegisterResp,
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
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { type SyncStatusResp } from "core/coins/ALEO/service/scanner";

// Mirror PopupServer.BIGINT_PORT_TAG. Encoded form is the marker followed
// by the decimal digits of the bigint. Anything else passes through.
const BIGINT_PORT_TAG = "__bigint__:";

function reviveBigInt(value: string | bigint): string | bigint {
  if (typeof value !== "string") return value;
  if (!value.startsWith(BIGINT_PORT_TAG)) return value;
  const digits = value.slice(BIGINT_PORT_TAG.length);
  if (!/^-?\d+$/.test(digits)) return value;
  return BigInt(digits);
}

function hydrateRecordFromPort(
  record: RecordDetailWithSpent,
): RecordDetailWithSpent {
  if (!record.parsedContent) return record;
  const next: Record<string, string | bigint> = {};
  for (const [key, value] of Object.entries(record.parsedContent)) {
    next[key] = reviveBigInt(value as string | bigint);
  }
  return {
    ...record,
    parsedContent: next as unknown as RecordDetailWithSpent["parsedContent"],
  };
}

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

  async scannerRegister(
    params: ScannerRegisterProps,
  ): Promise<ScannerRegisterResp> {
    return await this.#send("scannerRegister", params);
  }

  async scannerGetDecryptedOwnedRecords(
    params: ScannerGetDecryptedOwnedRecordsProps,
  ): Promise<RecordDetailWithSpent[]> {
    const raw: RecordDetailWithSpent[] = await this.#send(
      "scannerGetDecryptedOwnedRecords",
      params,
    );
    // chrome.runtime ports JSON-serialize the response, so bigint fields
    // PopupServer emitted as "__bigint__:N" strings need to be revived
    // before downstream UI consumers use them in arithmetic / TokenNum.
    return raw.map(hydrateRecordFromPort);
  }

  async scannerGetSyncStatus(
    params: ScannerRegisterProps,
  ): Promise<SyncStatusResp> {
    return await this.#send("scannerGetSyncStatus", params);
  }

  async scannerDeactivateViewConsumer(
    params: ScannerDeactivateViewConsumerProps,
  ): Promise<void> {
    await this.#send("scannerDeactivateViewConsumer", params);
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

  async resetWallet(): Promise<boolean> {
    return await this.#send("resetWallet", {});
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
