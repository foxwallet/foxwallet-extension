import { wrap } from "comlink";
import browser from "webextension-polyfill";
import type { WorkerAPI } from "./worker";
import { logger } from "@/common/utils/logger";

let singletonWorker: WorkerAPI | null = null;

const createAleoWorker = () => {
  if (!singletonWorker) {
    const worker = new Worker(new URL("worker.js", import.meta.url), {
      type: "module",
    });
    singletonWorker = wrap<WorkerAPI>(worker);
  }
  return singletonWorker;
};

createAleoWorker();

async function getPrivateKey(sendResponse: (param: any) => void) {
  try {
    const aleoWorker = createAleoWorker();
    await aleoWorker.initWasm();
    const privateKey = await aleoWorker.getPrivateKey();
    sendResponse(privateKey);
  } catch (err) {
    logger.log("==> err: ", err);
  }
}

browser.runtime.onMessage.addListener(handleMessages);

function handleMessages(
  message: any,
  sender: browser.Runtime.MessageSender,
  sendResponse: (param: any) => void,
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen") {
    return;
  }

  if (message.type === "get-private-key") {
    getPrivateKey(sendResponse).catch((err) => {
      logger.log(`==> ${message.type} err: `, err);
    });
    return true;
  }

  logger.warn(`Unexpected message type received: '${message.type}'.`);
}
