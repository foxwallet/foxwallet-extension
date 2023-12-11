import browser from "webextension-polyfill";
import { logger } from "@/common/utils/logger";
import // type AleoWorkerMessage,
// AleoWorkerMethod,
// type SyncBlockParams,
// type TaskParams,
"./aleo.di";
import { MainLoop } from "./main_loop";
import { ReserveChainConfigs } from "core/env";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  MessageOrigin,
  type BackgroundMessage,
  OffscreenMethod,
  type OffscreenMessage,
  OffscreenMessageType,
} from "@/common/types/offscreen";

browser.runtime.onMessage.addListener(handleMessages);

let mainLoop: MainLoop;

const getMainLoop = () => {
  if (!mainLoop) {
    mainLoop = MainLoop.getInstace(
      ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET_3].rpcList,
    );
  }
  return mainLoop;
};

function handleMessages(
  message: BackgroundMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (param: OffscreenMessage) => void,
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.origin !== MessageOrigin.BACKGROUND_TO_OFFSCREEN) {
    return;
  }

  switch (message.type) {
    case OffscreenMethod.INIT_WORKER: {
      const main = getMainLoop();
      void main.loop();
      sendResponse({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TO_BACKGROUND,
        payload: { error: null, data: null },
      });
      break;
    }
    case OffscreenMethod.SEND_TX: {
      const main = getMainLoop();
      const params = message.payload;
      main
        .sendTransaction(params)
        .then((resp) => {
          sendResponse({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_TO_BACKGROUND,
            payload: {
              error: null,
              data: resp,
            },
          });
        })
        .catch((err) => {
          logger.log(`==> ${message.type} err: `, err);
          if (err instanceof Error) {
            sendResponse({
              type: OffscreenMessageType.RESPONSE,
              origin: MessageOrigin.OFFSCREEN_TO_BACKGROUND,
              payload: {
                error: err.message,
                data: null,
              },
            });
          }
        });
      return true;
    }
    default: {
      logger.warn(`Unexpected message type received'.`);
    }
  }
}
