import { type Runtime } from "webextension-polyfill";
import { type IHandler } from "../../../common/utils/connection";
import {
  type ServerMessage,
  MessageType,
  WalletModule,
  type ServerPayload,
} from "../../../common/types/message";
import { logger } from "../../../common/utils/logger";
import { type PopupWalletServer } from "../servers/PopupServer";
import { PortName } from "../../../common/types/port";
import {
  executeServerMethod,
  type PopupServerMethod,
} from "../servers/IWalletServer";
import { Mutex } from "async-mutex";
import browser from "webextension-polyfill";
import { isWalletDocument } from "@/common/utils/walletUI";

const mutex = new Mutex();
const popupMethods = {
  initPassword: true,
  hasAuth: true,
  login: true,
  lock: true,
  timeoutLock: true,
  createWallet: true,
  regenerateWallet: true,
  importHDWallet: true,
  addAccount: true,
  importPrivateKey: true,
  getHDWallet: true,
  getSimpleWallet: true,
  getAllWallet: true,
  rescanAleo: true,
  resetChain: true,
  scannerRegister: true,
  scannerGetDecryptedOwnedRecords: true,
  scannerGetSyncStatus: true,
  scannerDeactivateViewConsumer: true,
  getAleoComplianceProof: true,
  sendAleoTransaction: true,
  isSendingAleoTransaction: true,
  signMessage: true,
  onRequestFinish: true,
  getHDMnemonic: true,
  resetWallet: true,
  deleteWallet: true,
  getPrivateKey: true,
  checkPassword: true,
  getSelectedGroupAccount: true,
  setSelectedGroupAccount: true,
} satisfies Record<PopupServerMethod, true>;

function isPopupMethod(method: unknown): method is PopupServerMethod {
  return typeof method === "string" && Object.hasOwn(popupMethods, method);
}

export class PopupServerHandler implements IHandler {
  private readonly popupPorts = new Set<Runtime.Port>();

  constructor(private popupServer: PopupWalletServer) {}

  hasActivePort(): boolean {
    return this.popupPorts.size > 0;
  }

  wrapPopupResp(rawResp: ServerPayload, id: string) {
    return {
      id,
      payload: rawResp,
    };
  }

  handle(port: Runtime.Port): void | Promise<void> {
    if (!isWalletDocument(browser.runtime, port.sender)) {
      port.disconnect();
      return;
    }
    this.popupPorts.add(port);
    port.onMessage.addListener(async (msg: ServerMessage) => {
      const release = await mutex.acquire();
      await executeServerMethod(this.popupServer.clearTimeoutLock());
      try {
        if (msg.type !== MessageType.REQUEST) {
          return;
        }
        const { id, method, payload, origin } = msg;
        if (origin !== PortName.POPUP_TO_BACKGROUND) {
          logger.error("PopupServerHandler Invalid origin ", msg.origin);
          return;
        }
        if (!isPopupMethod(method)) {
          port.postMessage(
            this.wrapPopupResp(
              await executeServerMethod(
                Promise.reject(new Error("Unsupported popup method")),
              ),
              id,
            ),
          );
          return;
        }
        const result =
          method === "onRequestFinish"
            ? this.popupServer[method](payload, port.sender)
            : this.popupServer[method](payload);
        const resp = this.wrapPopupResp(
          await executeServerMethod(result as any),
          id,
        );
        port.postMessage(resp);
      } finally {
        release();
      }
    });
    port.onDisconnect.addListener(async () => {
      this.popupPorts.delete(port);
      console.log("===> PopupServerHandler onDisconnect");
      if (!this.hasActivePort())
        await executeServerMethod(this.popupServer.timeoutLock());
    });
  }
}
