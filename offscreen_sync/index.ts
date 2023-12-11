import browser from "webextension-polyfill";
import { logger } from "@/common/utils/logger";
import { MainLoop } from "./main_loop";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  MessageOrigin,
  type BackgroundMessage,
  OffscreenMethod,
  type OffscreenMessage,
  OffscreenMessageType,
} from "@/common/types/offscreen";
import { ReserveChainConfigs } from "../env";

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
    default: {
      logger.warn(`Unexpected message type received'.`);
    }
  }
}
