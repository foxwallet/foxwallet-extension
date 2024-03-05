import { AleoRequestDeploymentParams } from "core/coins/ALEO/types/Deployment";
import { ReserveChainConfigs } from "../../../env";
import {
  type BackgroundMessage,
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessage,
} from "../../../offscreen_transaction/src/types";
import * as browser from "webextension-polyfill";
import { AleoSendTxParams } from "core/coins/ALEO/types/Transaction";

const OFFSCREEN_TX_DOCUMENT_PATH = "/offscreen_tx.html";
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;

async function hasDocument(path: string): Promise<boolean> {
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
    const has = await hasDocument(path);
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

export async function stopSync() {
  await closeOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
}

export async function stopSending() {
  await closeOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
}

export async function syncBlocks() {
  const has = await hasDocument(OFFSCREEN_DOCUMENT_PATH);
  if (has) {
    return;
  }
  console.log("===> initWorker setupOffscreenDocument");
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  console.log("===> initWorker sendMessage");
  const messsage: BackgroundMessage = {
    type: OffscreenMethod.INIT_WORKER,
    origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN,
    payload: null,
  };
  const initResp = await chrome.runtime.sendMessage(messsage);
  console.log("===> initWorker resp: ", initResp);
  return initResp;
}

export async function sendTransaction(params: AleoSendTxParams) {
  try {
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
      payload: {
        ...params,
        rpcList: ReserveChainConfigs.ALEO_TESTNET3.rpcList,
      },
    };
    const sendTxResp: OffscreenMessage =
      await chrome.runtime.sendMessage(messsage);
    console.log("===> sendTx resp: ", sendTxResp);
    return sendTxResp;
  } catch (err) {
    console.error("sendTransaction failed: ", err);
    return undefined;
  } finally {
    console.log(
      "===> closeOffscreenDocument after tx",
      OFFSCREEN_TX_DOCUMENT_PATH,
    );
    await closeOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
    console.log(
      "===> setupOffscreenDocument after tx",
      OFFSCREEN_DOCUMENT_PATH,
    );
    syncBlocks();
  }
}

async function getSendingTxStatus() {
  try {
    const messsage: BackgroundMessage = {
      type: OffscreenMethod.IS_SENDING_TX,
      origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
      payload: {},
    };
    const sendingTxResp: OffscreenMessage =
      await chrome.runtime.sendMessage(messsage);
    console.log("===> sendingTx resp: ", sendingTxResp);
    if (!sendingTxResp?.payload || sendingTxResp?.payload?.error) {
      throw new Error(
        "Get sending status failed " + sendingTxResp?.payload?.error,
      );
    }
    return !!sendingTxResp.payload.data;
  } catch (err) {
    console.error("===> getSendingTxStatus error: ", err);
    return false;
  }
}

export async function isSendingAleoTransaction() {
  const has = await hasDocument(OFFSCREEN_TX_DOCUMENT_PATH);
  console.log("===> isSendingAleoTransaction has document: ", has);
  if (!has) {
    return false;
  }
  const status = await getSendingTxStatus();
  if (status) {
    return true;
  }
  const delayStatus = await new Promise<boolean>((resolve) => {
    setTimeout(async () => {
      const status = await getSendingTxStatus();
      resolve(status);
    }, 2000);
  });
  console.log("===> isSendingAleoTransaction: ", status, delayStatus);
  if (!delayStatus) {
    await stopSending();
    syncBlocks();
  }
  return delayStatus;
}

export async function sendDeployment(params: AleoRequestDeploymentParams) {
  try {
    console.log("===> sendTransaction closeOffscreenTxDocument");
    await closeOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
    console.log(
      "===> initWorker setupOffscreenDocument ",
      OFFSCREEN_TX_DOCUMENT_PATH,
    );
    await setupOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
    console.log("===> initWorker sendMessage");
    const messsage: BackgroundMessage = {
      type: OffscreenMethod.DEPLOY,
      origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
      payload: {
        ...params,
        rpcList: ReserveChainConfigs.ALEO_TESTNET3.rpcList,
      },
    };
    const sendTxResp: OffscreenMessage =
      await chrome.runtime.sendMessage(messsage);
    console.log("===> sendTx resp: ", sendTxResp);
    return sendTxResp;
  } catch (err) {
    console.error("sendDeployment failed: ", err);
    return undefined;
  } finally {
    await closeOffscreenDocument(OFFSCREEN_TX_DOCUMENT_PATH);
    console.log(
      "===> closeOffscreenDocument after tx",
      OFFSCREEN_TX_DOCUMENT_PATH,
    );
    syncBlocks();
    console.log(
      "===> setupOffscreenDocument after tx",
      OFFSCREEN_DOCUMENT_PATH,
    );
  }
}
