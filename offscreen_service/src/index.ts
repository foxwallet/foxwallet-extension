import * as browser from "webextension-polyfill";
import {
  MessageOrigin,
  type BackgroundMessage,
  OffscreenMethod,
  type OffscreenMessage,
  OffscreenMessageType,
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "./types";

let isSendingTx = false;
let inited = false;

let worker: Worker | null = null;
const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL("worker.js", import.meta.url), {
      type: "module",
    });
  }
  return worker;
};

// Load the SDK lazily so the offscreen message listener is registered
// immediately. Static SDK imports can block page evaluation while WASM loads.
type SdkModule = typeof import("@provablehq/sdk/mainnet.js");
let sdkPromise: Promise<SdkModule> | undefined;
const loadSdk = async (): Promise<SdkModule> => {
  if (!sdkPromise) {
    sdkPromise = import("@provablehq/sdk/mainnet.js");
  }
  return await sdkPromise;
};

const respond = async (
  message: OffscreenMessage,
): Promise<OffscreenMessage> => message;

const runWorkerTask = async (
  taskType: "sendTx" | "deploy",
  payload: BackgroundMessage["payload"],
): Promise<OffscreenMessage> => {
  return await new Promise<OffscreenMessage>((resolve) => {
    isSendingTx = true;
    const worker = getWorker();
    const postTask = () => {
      worker.postMessage({
        type: taskType,
        payload,
      });
    };
    const cleanup = () => {
      worker.removeEventListener("error", onError);
      worker.removeEventListener("message", onMessage);
      isSendingTx = false;
    };
    const onError = (err: ErrorEvent) => {
      cleanup();
      resolve({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: err.message, data: null },
      });
    };
    const onMessage = (event: MessageEvent) => {
      console.log("===> worker message: ", event);
      if (event.data?.type === "inited") {
        inited = true;
        postTask();
      } else if (event.data?.type === "finished") {
        cleanup();
        resolve({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
          payload: { error: null, data: "finished" },
        });
      } else {
        const { error, data } = event.data;
        console.log("===> task resp: ", error, data);
      }
    };
    worker.addEventListener("error", onError);
    worker.addEventListener("message", onMessage);
    if (inited) {
      postTask();
    }
  });
};

const handleScannerEncrypt = async (
  payload: ScannerEncryptRegistrationPayload,
): Promise<OffscreenMessage<ScannerEncryptRegistrationResult>> => {
  try {
    const { ViewKey, encryptRegistrationRequest } = await loadSdk();
    const vk = ViewKey.from_string(payload.viewKey);
    const ciphertext = encryptRegistrationRequest(
      payload.publicKey,
      vk,
      payload.start,
    );
    return {
      type: OffscreenMessageType.RESPONSE,
      origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
      payload: { error: null, data: { ciphertext } },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      type: OffscreenMessageType.ERROR,
      origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
      payload: { error: msg, data: null },
    };
  }
};

browser.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    sender: browser.Runtime.MessageSender,
  ): Promise<OffscreenMessage> | undefined => {
    // Return early if this message isn't meant for the offscreen document.
    if (
      message.origin !== MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX &&
      message.origin !== MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER
    ) {
      return undefined;
    }

    console.log("===> handleMessages: ", message, sender);

    switch (message.type) {
      case OffscreenMethod.IS_SENDING_TX: {
        return respond({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
          payload: { error: null, data: isSendingTx },
        });
      }
      case OffscreenMethod.SEND_TX: {
        return runWorkerTask("sendTx", message.payload);
      }
      case OffscreenMethod.DEPLOY: {
        return runWorkerTask("deploy", message.payload);
      }
      case OffscreenMethod.SCANNER_PING: {
        return respond({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
          payload: { error: null, data: null },
        });
      }
      case OffscreenMethod.SCANNER_ENCRYPT_REGISTRATION: {
        const payload =
          message.payload as ScannerEncryptRegistrationPayload | null;
        if (!payload) {
          return respond({
            type: OffscreenMessageType.ERROR,
            origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
            payload: { error: "missing payload", data: null },
          });
        }
        return handleScannerEncrypt(payload);
      }
      default: {
        console.warn(`Unexpected message type received'.`);
        return respond({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
          payload: { error: "Unexpected message type received", data: null },
        });
      }
    }
  },
);

void loadSdk().catch((error) => {
  console.error("[offscreen] SDK preload failed", error);
});
