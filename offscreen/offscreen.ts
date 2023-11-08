import { wrap, proxy } from "comlink";
import browser from "webextension-polyfill";
import type { WorkerAPI } from "./worker";
import { logger } from "@/common/utils/logger";
import {
  type AleoWorkerMessage,
  AleoWorkerMethod,
  type SyncBlockParams,
} from "./aleo.di";

const enableMeasure = true;

let singletonWorker: WorkerAPI | null = null;

export function mainLogger(type: "log" | "error", ...args: any[]) {
  if (type === "error") {
    console.error("===> [WORKER]: ", ...args);
  } else {
    console.log("===> [WORKER]: ", ...args);
  }
}

const createAleoWorker = () => {
  if (!singletonWorker) {
    const worker = new Worker(new URL("worker.js", import.meta.url), {
      type: "module",
    });
    singletonWorker = wrap<WorkerAPI>(worker);
    singletonWorker.setLogger(proxy(mainLogger));
  }
  return singletonWorker;
};

async function initWorker(
  workerId: number,
  rpcList: string[],
  enableMeasure: boolean,
  sendResponse: (param: any) => void,
) {
  const aleoWorker = createAleoWorker();
  await aleoWorker.initWasm();
  await aleoWorker.initAleoWorker(workerId, rpcList, enableMeasure);
  sendResponse({ error: null, data: true });
}

async function getPrivateKey(sendResponse: (param: any) => void) {
  const aleoWorker = createAleoWorker();
  await aleoWorker.initWasm();
  const privateKey = await aleoWorker.getPrivateKey();
  sendResponse({ error: null, data: privateKey });
}

async function syncBlocks(
  params: SyncBlockParams,
  sendResponse: (param: any) => void,
) {
  try {
    const aleoWorker = createAleoWorker();
    await aleoWorker.initWasm();
    const blocksInfo = await aleoWorker.syncBlocks(params);
    sendResponse({ error: null, data: blocksInfo });
  } catch (err) {
    logger.log("==> err: ", err);
    if (err instanceof Error) {
      sendResponse({ error: err.message });
    }
  }
}

browser.runtime.onMessage.addListener(handleMessages);

function handleMessages(
  message: AleoWorkerMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (param: any) => void,
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen") {
    return;
  }

  switch (message.type) {
    case AleoWorkerMethod.INIT_WORKER: {
      initWorker(0, message.params, enableMeasure, sendResponse).catch(
        (err) => {
          logger.log(`==> ${message.type} err: `, err);
          if (err instanceof Error) {
            sendResponse({ error: err.message });
          }
        },
      );
      return true;
    }
    case AleoWorkerMethod.GET_PRIVATE_KEY: {
      getPrivateKey(sendResponse).catch((err) => {
        logger.log(`==> ${message.type} err: `, err);
        if (err instanceof Error) {
          sendResponse({ error: err.message });
        }
      });
      return true;
    }
    case AleoWorkerMethod.SYNC_BLOCKS: {
      const params = message.params as SyncBlockParams;
      syncBlocks(params, sendResponse).catch((err) => {
        logger.log(`==> ${message.type} err: `, err);
        if (err instanceof Error) {
          sendResponse({ error: err.message });
        }
      });
      return true;
    }
    default: {
      logger.warn(`Unexpected message type received'.`);
    }
  }
}
