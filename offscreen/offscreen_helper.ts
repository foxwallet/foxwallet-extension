import { logger } from "@/common/utils/logger";
import {
  type BackgroundMessage,
  MessageOrigin,
  OffscreenMethod,
} from "@/common/types/offscreen";
import type { AleoSendTxParams } from "core/coins/ALEO/types/Tranaction";
import { nanoid } from "nanoid";

const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;

async function hasDocument(path: string) {
  if ("getContexts" in chrome.runtime) {
    // @ts-expect-error getContexts not in type
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [path],
    });
    return contexts.length > 0;
  } else {
    // @ts-expect-error matchAll not in type
    const matchedClients = await clients.matchAll();
    // @ts-expect-error client type
    return await matchedClients.some((client) => {
      return client.url.includes(chrome.runtime.id);
    });
  }
}

async function setupOffscreenDocument(path: string) {
  try {
    const has = await hasDocument(OFFSCREEN_DOCUMENT_PATH);
    if (!has) {
      // create offscreen document
      if (creating) {
        await creating;
      } else {
        creating = chrome.offscreen.createDocument({
          url: path,
          reasons: [
            chrome.offscreen.Reason.WORKERS,
            chrome.offscreen.Reason.LOCAL_STORAGE,
          ],
          justification: "Syncing aleo blocks",
        });

        await creating;
        creating = null;
      }
    }
  } catch (err: any) {
    if (!err.message.startsWith("Only a single offscreen")) {
      throw err;
    }
  }
}

async function closeOffscreenDocument() {
  const has = await hasDocument(OFFSCREEN_DOCUMENT_PATH);
  if (!has) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

export async function setupOffscreen() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
}

export async function initWorker() {
  logger.log("===> initWorker setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  logger.log("===> initWorker sendMessage");
  const messsage: BackgroundMessage = {
    type: OffscreenMethod.INIT_WORKER,
    origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN,
    payload: null,
  };
  const initResp = await chrome.runtime.sendMessage(messsage);
  logger.log("===> initWorker resp: ", initResp);
  return initResp;
}

export async function sendTransaction(_params?: AleoSendTxParams) {
  logger.log("===> initWorker setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  logger.log("===> initWorker sendMessage");
  const localId = nanoid();
  const timestamp = Date.now();
  const params: AleoSendTxParams = {
    privateKey: "",
    address: "aleo1xs53pjftr8vst9ev2drwdu0kyyj2f4fxx93j3n30hfr8dqjnwq8qyvka7t",
    chainId: "testnet3",
    programId: "credits.aleo",
    functionName: "transfer_public_to_private",
    inputs: [
      "aleo1xs53pjftr8vst9ev2drwdu0kyyj2f4fxx93j3n30hfr8dqjnwq8qyvka7t",
      "2000000u64",
    ],
    baseFee: 153388,
    priorityFee: 10000,
    feeRecord: null,
    localId,
    timestamp,
  };
  const messsage: BackgroundMessage = {
    type: OffscreenMethod.SEND_TX,
    origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN,
    payload: params,
  };
  const sendTxResp = await chrome.runtime.sendMessage(messsage);
  logger.log("===> sendTx resp: ", sendTxResp);
  return sendTxResp;
}

// export async function syncBlocks(params: SyncBlockParams) {
//   logger.log("===> syncBlocks setupOffscreenDocument");
//   await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
//   logger.log("===> syncBlocks sendMessage");
//   const blocksInfo = await chrome.runtime.sendMessage({
//     type: AleoWorkerMethod.SYNC_BLOCKS,
//     target: "offscreen",
//     params,
//   });
//   logger.log("===> syncBlocks resp: ", blocksInfo);
//   return blocksInfo;
// }

// export async function getPrivateKey() {
//   logger.log("===> getPrivateKey setupOffscreenDocument");
//   await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
//   logger.log("===> getPrivateKey sendMessage");
//   const privateKey = await chrome.runtime.sendMessage({
//     type: AleoWorkerMethod.GET_PRIVATE_KEY,
//     target: "offscreen",
//   });
//   logger.log("===> getPrivateKey resp: ", privateKey);
//   return privateKey;
// }
