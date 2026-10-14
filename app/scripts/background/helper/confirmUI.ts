import browser, { type Runtime } from "webextension-polyfill";
import {
  WALLET_UI_PORT,
  isWalletDocument,
  type WalletUIMessage,
} from "@/common/utils/walletUI";
import { ERROR_CODE } from "@/common/types/error";
import type { DappRequest } from "@/database/types/dapp";
import type { DappStorage } from "../store/dapp/DappStorage";
import type { RequestFinfishProps } from "../servers/IWalletServer";
import { createNotification } from "./notification";

type Panel = { port: Runtime.Port; windowId: number };
type Pending = {
  id: string;
  panel?: Panel;
  windowId?: number;
  settled: boolean;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
};

// All chains share one queue so requests cannot replace each other's confirmation.
export class ConfirmUI {
  private panels = new Map<Runtime.Port, Panel>();
  private pending?: Pending;
  private queue: Promise<unknown> = Promise.resolve();
  private panelEnabled: () => boolean = () => true;

  constructor(
    private api = browser,
    private openNotification = createNotification,
  ) {}

  start() {
    this.api.runtime.onConnect.addListener((port) => {
      if (port.name !== WALLET_UI_PORT) return;
      if (
        !isWalletDocument(this.api.runtime, port.sender) ||
        port.sender?.url?.split(/[?#]/)[0] !==
          this.api.runtime.getURL("sidepanel.html")
      ) {
        port.disconnect();
        return;
      }
      port.onMessage.addListener((message) => {
        if (
          message?.type === "ready" &&
          Number.isInteger(message.windowId) &&
          message.windowId >= 0
        ) {
          this.panels.set(port, { port, windowId: message.windowId });
        }
      });
      port.onDisconnect.addListener(() => {
        this.panels.delete(port);
        if (this.pending?.panel?.port === port) {
          this.finish({
            requestId: this.pending.id,
            error: ERROR_CODE.USER_CANCEL,
          });
        }
      });
    });
  }

  setPanelEnabled(panelEnabled: () => boolean) {
    this.panelEnabled = panelEnabled;
  }

  private async getPanel() {
    if (!this.panelEnabled()) return undefined;
    const { id } = await this.api.windows.getLastFocused();
    return [...this.panels.values()].find((panel) => panel.windowId === id);
  }

  private post(panel: Panel, message: WalletUIMessage) {
    panel.port.postMessage(message);
  }

  async navigate(path: string) {
    const panel = await this.getPanel();
    if (!panel) return false;
    try {
      // Keep an active confirmation on screen until its decision is complete.
      if (this.pending) return false;
      this.post(panel, { type: "navigate", path });
      return true;
    } catch {
      this.panels.delete(panel.port);
      return false;
    }
  }

  canFinish(requestId: string, sender?: Runtime.MessageSender) {
    const pending = this.pending;
    if (!pending || pending.id !== requestId || !sender) return false;
    const documentUrl = sender.url?.split(/[?#]/)[0];
    const senderWithDocumentId = sender as Runtime.MessageSender & {
      documentId?: string;
    };
    const panelSender = pending.panel?.port.sender as
      | (Runtime.MessageSender & { documentId?: string })
      | undefined;
    if (pending.panel) {
      return (
        documentUrl === this.api.runtime.getURL("sidepanel.html") &&
        (!panelSender?.documentId ||
          !senderWithDocumentId.documentId ||
          panelSender.documentId === senderWithDocumentId.documentId)
      );
    }
    return (
      documentUrl === this.api.runtime.getURL("notification.html") &&
      sender.url?.includes(requestId) === true
    );
  }

  request<T>(
    path: string,
    request: DappRequest,
    storage: Pick<DappStorage, "setDappRequest" | "removeDappRequest">,
    approve: (data: any) => Promise<T>,
  ): Promise<T> {
    const task = this.queue
      .catch(() => undefined)
      .then(async () => {
        await storage.setDappRequest(request);
        let pending!: Pending;
        const decision = new Promise<any>((resolve, reject) => {
          pending = { id: request.id, settled: false, resolve, reject };
        });
        // A window can close before windows.create has returned its ID.
        void decision.catch(() => undefined);
        this.pending = pending;
        const removedWindows = new Set<number>();
        const onRemoved = (id: number) => {
          removedWindows.add(id);
          if (pending.windowId === id) {
            this.finish({
              requestId: request.id,
              error: ERROR_CODE.USER_CANCEL,
            });
          }
        };
        this.api.windows.onRemoved.addListener(onRemoved);
        try {
          const panel = await this.getPanel();
          if (panel) {
            pending.panel = panel;
            try {
              this.post(panel, {
                type: "confirm-open",
                requestId: request.id,
                path,
              });
            } catch {
              this.panels.delete(panel.port);
              pending.panel = undefined;
            }
          }
          if (!pending.panel && !pending.settled) {
            const notification = await this.openNotification(path);
            if (notification.id === undefined)
              throw new Error("Could not open confirmation window");
            pending.windowId = notification.id;
            if (removedWindows.has(notification.id)) {
              this.finish({
                requestId: request.id,
                error: ERROR_CODE.USER_CANCEL,
              });
            }
          }
          const data = await decision;
          return await approve(data);
        } finally {
          this.pending = undefined;
          this.api.windows.onRemoved.removeListener(onRemoved);
          if (pending.panel) {
            try {
              this.post(pending.panel, {
                type: "confirm-done",
                requestId: request.id,
              });
            } catch {
              /* The panel may already be closed. */
            }
          } else if (pending.windowId !== undefined) {
            await this.api.windows
              .remove(pending.windowId)
              .catch(() => undefined);
          }
          await storage.removeDappRequest(request.id);
        }
      });
    this.queue = task;
    return task;
  }

  finish({ requestId, error, data }: RequestFinfishProps) {
    const pending = this.pending;
    if (!pending || pending.id !== requestId || pending.settled) return;
    pending.settled = true;
    if (error) pending.reject(new Error(error));
    else pending.resolve(data);
  }
}

export const confirmUI = new ConfirmUI();
