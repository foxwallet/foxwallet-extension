import browser from "webextension-polyfill";
import { logger } from "@/common/utils/logger";
import // type AleoWorkerMessage,
// AleoWorkerMethod,
// type SyncBlockParams,
// type TaskParams,
"../offscreen/aleo.di";
import { MainLoop } from "./mainLoop";
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
      mainLoop = MainLoop.getInstace(
        ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET_3].rpcList,
      );
      void mainLoop.loop();
      sendResponse({
        type: OffscreenMessageType.RESPONSE,
        origin: MessageOrigin.OFFSCREEN_TO_BACKGROUND,
        payload: { error: null, data: null },
      });
      break;
    }
    case OffscreenMethod.SEND_TX: {
      const params = message.payload;
      mainLoop
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
