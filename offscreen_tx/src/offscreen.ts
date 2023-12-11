import * as browser from "webextension-polyfill";
// import { MainLoop } from "./main_loop";
// import { wrap } from "comlink";
import { ReserveChainConfigs } from "./env";
import { InnerChainUniqueId } from "./types";
import {
  MessageOrigin,
  type BackgroundMessage,
  OffscreenMethod,
  type OffscreenMessage,
  OffscreenMessageType,
} from "./types";

browser.runtime.onMessage.addListener(handleMessages);

// @ts-ignore
window.mainLoop = null;

// const getMainLoop = () => {
//   // @ts-ignore
//   let mainLoop: MainLoop | undefined = window.mainLoop;
//   if (!mainLoop) {
//     mainLoop = MainLoop.getInstace(
//       ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET_3].rpcList,
//     );
//   }
//   // @ts-ignore
//   window.mainLoop = mainLoop;
//   return mainLoop;
// };

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
    case OffscreenMethod.SEND_TX: {
      // const main = getMainLoop();
      // const params = message.payload;

      await new Promise<void>((resolve, reject) => {
        const worker = new Worker(new URL("worker.js", import.meta.url), {
          type: "module",
        });
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
            worker.postMessage({
              type: "sendTx",
              payload: message.payload,
            });
            return;
          } else {
            const { error, data } = event.data;
            if (error) {
              sendResponse({
                type: OffscreenMessageType.RESPONSE,
                origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
                payload: { error, data: null },
              });
              resolve();
            } else {
              sendResponse({
                type: OffscreenMessageType.RESPONSE,
                origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
                payload: { error: null, data },
              });
              resolve();
            }
          }
        });
      });
      // await main
      //   .sendTransaction(params)
      //   .then((resp) => {
      //     sendResponse({
      //       type: OffscreenMessageType.RESPONSE,
      //       origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
      //       payload: {
      //         error: null,
      //         data: resp,
      //       },
      //     });
      //   })
      //   .catch((err) => {
      //     console.log(`==> ${message.type} err: `, err);
      //     if (err instanceof Error) {
      //       sendResponse({
      //         type: OffscreenMessageType.RESPONSE,
      //         origin: MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND,
      //         payload: {
      //           error: err.message,
      //           data: null,
      //         },
      //       });
      //     }
      //   });
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
