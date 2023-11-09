import { logger } from "@/common/utils/logger";
import { AleoWorkerMethod, type SyncBlockParams } from "./aleo.di";

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
          justification: "For syncing aleo transactions",
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

export async function initWorker(rpcList: string[]) {
  logger.log("===> initWorker setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  logger.log("===> initWorker sendMessage");
  const initResp = await chrome.runtime.sendMessage({
    type: AleoWorkerMethod.INIT_WORKER,
    target: "offscreen",
    params: rpcList,
  });
  logger.log("===> initWorker resp: ", initResp);
  return initResp;
}

export async function syncBlocks(params: SyncBlockParams) {
  logger.log("===> syncBlocks setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  logger.log("===> syncBlocks sendMessage");
  const blocksInfo = await chrome.runtime.sendMessage({
    type: AleoWorkerMethod.SYNC_BLOCKS,
    target: "offscreen",
    params,
  });
  logger.log("===> syncBlocks resp: ", blocksInfo);
  return blocksInfo;
}

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
