import * as browser from "webextension-polyfill";
import {
  MessageOrigin,
  type BackgroundMessage,
  OffscreenMethod,
  type OffscreenMessage,
  OffscreenMessageType,
} from "./types";

browser.runtime.onMessage.addListener(handleMessages);

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

async function handleMessages(
  message: BackgroundMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (param: OffscreenMessage) => void,
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.origin !== MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX) {
    return;
  }

  console.log("===> handleMessages: ", message, sender, sendResponse);

  switch (message.type) {
    case OffscreenMethod.IS_SENDING_TX: {
      sendResponse({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: null, data: isSendingTx },
      });
      return {
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: null, data: isSendingTx },
      };
    }
    case OffscreenMethod.SEND_TX: {
      await new Promise<void>((resolve, reject) => {
        isSendingTx = true;
        const worker = getWorker();
        worker.addEventListener("error", (err) => {
          sendResponse({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
            payload: { error: err.message, data: null },
          });
          resolve();
        });
        worker.addEventListener("message", (event) => {
          console.log("===> worker message: ", event);
          if (event.data?.type === "inited") {
            inited = true;
            worker.postMessage({
              type: "sendTx",
              payload: message.payload,
            });
          } else if (event.data?.type === "finished") {
            sendResponse({
              type: OffscreenMessageType.RESPONSE,
              origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
              payload: { error: null, data: "finished" },
            });
            resolve();
          } else {
            const { error, data } = event.data;
            console.log("===> task resp: ", error, data);
          }
        });
        if (inited) {
          worker.postMessage({
            type: "sendTx",
            payload: message.payload,
          });
        }
      })
        .then(() => {
          isSendingTx = false;
        })
        .catch((err) => {
          console.error("handleMessages SEND_TX error: ", err);
          sendResponse({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
            payload: { error: err.message, data: null },
          });
          isSendingTx = false;
        });
      return {
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: null, data: null },
      };
    }
    case OffscreenMethod.DEPLOY: {
      await new Promise<void>((resolve, reject) => {
        isSendingTx = true;
        const worker = getWorker();
        worker.addEventListener("error", (err) => {
          sendResponse({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
            payload: { error: err.message, data: null },
          });
          resolve();
        });
        worker.addEventListener("message", (event) => {
          console.log("===> worker message: ", event);
          if (event.data?.type === "inited") {
            inited = true;
            worker.postMessage({
              type: "deploy",
              payload: message.payload,
            });
          } else if (event.data?.type === "finished") {
            sendResponse({
              type: OffscreenMessageType.RESPONSE,
              origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
              payload: { error: null, data: "finished" },
            });
            resolve();
          } else {
            const { error, data } = event.data;
            console.log("===> deploy task resp: ", error, data);
          }
        });
        if (inited) {
          worker.postMessage({
            type: "deploy",
            payload: message.payload,
          });
        }
      })
        .then(() => {
          isSendingTx = false;
        })
        .catch((err) => {
          console.error("handleMessages DEPLOY error: ", err);
          sendResponse({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
            payload: { error: err.message, data: null },
          });
          isSendingTx = false;
        });
      return {
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
        payload: { error: null, data: null },
      };
    }
    default: {
      console.warn(`Unexpected message type received'.`);
    }
  }
}
