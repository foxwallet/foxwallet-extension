import type {
  ScannerEncryptRegistrationPayload,
  ScannerEncryptRegistrationResult,
} from "./types";

const MessageOrigin = {
  OFFSCREEN_TX_TO_BACKGROUND: "offscreen_tx_to_background",
  OFFSCREEN_SCANNER_TO_BACKGROUND: "offscreen_scanner_to_background",
  BACKGROUND_TO_OFFSCREEN_TX: "background_to_offscreen_tx",
  BACKGROUND_TO_OFFSCREEN_SCANNER: "background_to_offscreen_scanner",
} as const;

type MessageOriginValue = (typeof MessageOrigin)[keyof typeof MessageOrigin];

const OffscreenMessageType = {
  ERROR: "error",
  RESPONSE: "response",
} as const;

const OffscreenMethod = {
  SEND_TX: "send_tx",
  DEPLOY: "deploy",
  IS_SENDING_TX: "is_sending_tx",
  SCANNER_ENCRYPT_REGISTRATION: "scanner_encrypt_registration",
  SCANNER_PING: "scanner_ping",
} as const;

type OffscreenMessageTypeValue =
  (typeof OffscreenMessageType)[keyof typeof OffscreenMessageType];
type OffscreenMethodValue =
  (typeof OffscreenMethod)[keyof typeof OffscreenMethod];

interface OffscreenMessagePayload<T = unknown> {
  error: null | string;
  data: T | null;
}

interface OffscreenMessage<T = unknown> {
  type: OffscreenMessageTypeValue;
  origin: MessageOriginValue;
  payload: OffscreenMessagePayload<T>;
}

interface BackgroundMessage<T = unknown> {
  type: OffscreenMethodValue;
  origin: MessageOriginValue;
  payload: T;
}

let isSendingTx = false;
let txWorkerInited = false;

function getOffscreenAssetUrl(fileName: string): string {
  return chrome.runtime.getURL(`offscreen/${fileName}`);
}

let txWorker: Worker | null = null;
const getTxWorker = () => {
  if (!txWorker) {
    txWorker = new Worker(getOffscreenAssetUrl("worker.js"), {
      type: "module",
    });
  }
  return txWorker;
};

type ScannerWorkerTask = {
  id: number;
  type: "encryptRegistration";
  payload: ScannerEncryptRegistrationPayload;
};

type ScannerWorkerResponse = {
  id: number;
  error: string | null;
  data: ScannerEncryptRegistrationResult | null;
};

type ScannerOffscreenMessage =
  OffscreenMessage<ScannerEncryptRegistrationResult>;
type ScannerTaskResolver = (message: ScannerOffscreenMessage) => void;

let scannerWorker: Worker | null = null;
let scannerTaskId = 0;
const scannerPendingTasks = new Map<number, ScannerTaskResolver>();

const respond = async (message: OffscreenMessage): Promise<OffscreenMessage> =>
  message;

function scannerResponse(
  error: string | null,
  data: ScannerEncryptRegistrationResult | null,
): ScannerOffscreenMessage {
  return {
    type: error ? OffscreenMessageType.ERROR : OffscreenMessageType.RESPONSE,
    origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
    payload: { error, data },
  };
}

function resolveScannerTask(
  id: number,
  message: ScannerOffscreenMessage,
): void {
  const resolve = scannerPendingTasks.get(id);
  if (!resolve) return;
  scannerPendingTasks.delete(id);
  resolve(message);
}

function resolveAllScannerTasks(error: string): void {
  for (const id of Array.from(scannerPendingTasks.keys())) {
    resolveScannerTask(id, scannerResponse(error, null));
  }
}

function resetScannerWorker(): void {
  if (!scannerWorker) return;
  scannerWorker.removeEventListener("message", onScannerWorkerMessage);
  scannerWorker.removeEventListener("error", onScannerWorkerError);
  scannerWorker.removeEventListener(
    "messageerror",
    onScannerWorkerMessageError,
  );
  scannerWorker.terminate();
  scannerWorker = null;
}

function onScannerWorkerMessage(
  event: MessageEvent<ScannerWorkerResponse>,
): void {
  const response = event.data;
  if (typeof response?.id !== "number") return;

  resolveScannerTask(
    response.id,
    scannerResponse(response.error ?? null, response.data ?? null),
  );
}

function onScannerWorkerError(event: ErrorEvent): void {
  const message = event.message || "scanner worker failed";
  resolveAllScannerTasks(message);
  resetScannerWorker();
}

function onScannerWorkerMessageError(): void {
  resolveAllScannerTasks("scanner worker message serialization failed");
  resetScannerWorker();
}

function getScannerWorker(): Worker {
  if (!scannerWorker) {
    scannerWorker = new Worker(getOffscreenAssetUrl("scannerWorker.js"), {
      type: "module",
    });
    scannerWorker.addEventListener("message", onScannerWorkerMessage);
    scannerWorker.addEventListener("error", onScannerWorkerError);
    scannerWorker.addEventListener("messageerror", onScannerWorkerMessageError);
  }
  return scannerWorker;
}

const runWorkerTask = async (
  taskType: "sendTx" | "deploy",
  payload: BackgroundMessage["payload"],
): Promise<OffscreenMessage> => {
  return await new Promise<OffscreenMessage>((resolve) => {
    isSendingTx = true;
    const taskWorker = getTxWorker();
    let settled = false;
    const postTask = () => {
      taskWorker.postMessage({
        type: taskType,
        payload,
      });
    };
    const cleanup = () => {
      taskWorker.removeEventListener("error", onError);
      taskWorker.removeEventListener("message", onMessage);
      if (txWorker === taskWorker) {
        taskWorker.terminate();
        txWorker = null;
        txWorkerInited = false;
      }
      isSendingTx = false;
    };
    const finish = (message: OffscreenMessage) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(message);
    };
    const onError = (err: ErrorEvent) => {
      finish({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: err.message, data: null },
      });
    };
    const onMessage = (event: MessageEvent) => {
      console.log("===> worker message: ", event);
      if (event.data?.type === "inited") {
        txWorkerInited = true;
        postTask();
      } else if (event.data?.type === "finished") {
        finish({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
          payload: { error: "tx worker finished without result", data: null },
        });
      } else {
        const { error, data } = event.data ?? {};
        console.log("===> task resp: ", error, data);
        finish({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
          payload: { error: error ?? null, data: data ?? null },
        });
      }
    };
    taskWorker.addEventListener("error", onError);
    taskWorker.addEventListener("message", onMessage);
    if (txWorkerInited) {
      postTask();
    }
  });
};

const handleScannerEncrypt = async (
  payload: ScannerEncryptRegistrationPayload,
): Promise<OffscreenMessage<ScannerEncryptRegistrationResult>> => {
  try {
    const worker = getScannerWorker();
    const id = ++scannerTaskId;

    return await new Promise<ScannerOffscreenMessage>((resolve) => {
      scannerPendingTasks.set(id, resolve);
      const task: ScannerWorkerTask = {
        id,
        payload,
        type: "encryptRegistration",
      };
      try {
        worker.postMessage(task);
      } catch (err) {
        scannerPendingTasks.delete(id);
        const msg = err instanceof Error ? err.message : String(err);
        resolve(scannerResponse(msg, null));
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return scannerResponse(msg, null);
  }
};

function isOffscreenMessage(message: unknown): message is BackgroundMessage {
  if (!message || typeof message !== "object") return false;

  const origin = (message as { origin?: unknown }).origin;
  return (
    origin === MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX ||
    origin === MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER
  );
}

function responseOriginFor(message: BackgroundMessage): MessageOriginValue {
  return message.origin === MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER
    ? MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND
    : MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND;
}

function errorResponse(
  error: unknown,
  origin: MessageOriginValue,
): OffscreenMessage {
  const msg = error instanceof Error ? error.message : String(error);
  return {
    type: OffscreenMessageType.ERROR,
    origin,
    payload: { error: msg, data: null },
  };
}

async function handleMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
): Promise<OffscreenMessage> {
  console.log("===> handleMessages: ", message, sender);

  switch (message.type) {
    case OffscreenMethod.IS_SENDING_TX: {
      return await respond({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: null, data: isSendingTx },
      });
    }
    case OffscreenMethod.SEND_TX: {
      return await runWorkerTask("sendTx", message.payload);
    }
    case OffscreenMethod.DEPLOY: {
      return await runWorkerTask("deploy", message.payload);
    }
    case OffscreenMethod.SCANNER_PING: {
      return await respond({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
        payload: { error: null, data: null },
      });
    }
    case OffscreenMethod.SCANNER_ENCRYPT_REGISTRATION: {
      const payload =
        message.payload as ScannerEncryptRegistrationPayload | null;
      if (!payload) {
        return await respond({
          type: OffscreenMessageType.ERROR,
          origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
          payload: { error: "missing payload", data: null },
        });
      }
      return await handleScannerEncrypt(payload);
    }
    default: {
      console.warn(`Unexpected message type received'.`);
      return await respond({
        type: OffscreenMessageType.RESPONSE,
        origin: responseOriginFor(message),
        payload: { error: "Unexpected message type received", data: null },
      });
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isOffscreenMessage(message)) {
    return false;
  }

  void handleMessage(message, sender).then(
    (response) => {
      sendResponse(response);
    },
    (err) => {
      sendResponse(errorResponse(err, responseOriginFor(message)));
    },
  );

  return true;
});
