import {
  type BackgroundMessage,
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessage,
} from "./types";
import type { AleoSendTxParams } from "./types";
import * as browser from "webextension-polyfill";

const OFFSCREEN_TX_DOCUMENT_PATH = "/offscreen_tx.html";
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;

async function hasDocument(path: string) {
  if ("getContexts" in chrome.runtime) {
    // @ts-expect-error getContexts not in type
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [browser.runtime.getURL(path)],
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
    const has = await hasDocument(OFFSCREEN_TX_DOCUMENT_PATH);
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

async function closeOffscreenDocument(path: string) {
  const has = await hasDocument(path);
  if (!has) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

export async function setupOffscreen() {
  await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
}

export async function initWorker() {
  console.log("===> initWorker setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
  console.log("===> initWorker sendMessage");
  const messsage: BackgroundMessage = {
    type: OffscreenMethod.INIT_WORKER,
    origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
    payload: null,
  };
  const initResp = await chrome.runtime.sendMessage(messsage);
  console.log("===> initWorker resp: ", initResp);
  return initResp;
}

export async function sendTransaction(params: AleoSendTxParams) {
  console.log("===> sendTransaction closeOffscreenTxDocument");
  await closeOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  console.log(
    "===> initWorker setupOffscreenDocument ",
    OFFSCREEN_TX_DOCUMENT_PATH,
  );
  await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
  console.log("===> initWorker sendMessage");
  const messsage: BackgroundMessage = {
    type: OffscreenMethod.SEND_TX,
    origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
    payload: params,
  };
  const sendTxResp: OffscreenMessage =
    await chrome.runtime.sendMessage(messsage);
  console.log("===> sendTx resp: ", sendTxResp);
  await closeOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
  console.log(
    "===> closeOffscreenDocument after tx",
    OFFSCREEN_TX_DOCUMENT_PATH,
  );
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  console.log("===> setupOffscreenDocument after tx", OFFSCREEN_DOCUMENT_PATH);
  return sendTxResp;
}

// export async function syncBlocks(params: SyncBlockParams) {
//   console.log("===> syncBlocks setupOffscreenDocument");
//   await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
//   console.log("===> syncBlocks sendMessage");
//   const blocksInfo = await chrome.runtime.sendMessage({
//     type: AleoWorkerMethod.SYNC_BLOCKS,
//     target: "offscreen",
//     params,
//   });
//   console.log("===> syncBlocks resp: ", blocksInfo);
//   return blocksInfo;
// }

// export async function getPrivateKey() {
//   console.log("===> getPrivateKey setupOffscreenDocument");
//   await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
//   console.log("===> getPrivateKey sendMessage");
//   const privateKey = await chrome.runtime.sendMessage({
//     type: AleoWorkerMethod.GET_PRIVATE_KEY,
//     target: "offscreen",
//   });
//   console.log("===> getPrivateKey resp: ", privateKey);
//   return privateKey;
// }
