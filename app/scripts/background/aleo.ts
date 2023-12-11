import { AleoWorker } from "../../../offscreen/aleo";
import init from "aleo_wasm";
import {
  initWorker,
  sendTransaction,
  setupOffscreen,
} from "../../../offscreen/offscreen_helper";
import { Future } from "aleo_wasm";
import { parseU64 } from "../../../offscreen/helper";
import browser from "webextension-polyfill";
import {
  MessageOrigin,
  OffscreenMessage,
  OffscreenMessageType,
} from "@/common/types/offscreen";
import { nanoid } from "nanoid";
import { AleoSendTxParams } from "core/coins/ALEO/types/Tranaction";

const onOffscreenMessage = (
  message: OffscreenMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (data: any) => void,
) => {
  console.log("===> onOffscreenMessage: ", message);
  if (
    message.origin !== MessageOrigin.OFFSCREEN_TO_BACKGROUND &&
    message.origin !== MessageOrigin.OFFSCREEN_TX_TO_BACKGROUND
  ) {
    return;
  }
  const { type, payload } = message;

  switch (type) {
    case OffscreenMessageType.ERROR: {
      console.log("===> offscreen error: ", payload);
      sendResponse(true);
      break;
    }
  }
};

export async function offscreen() {
  browser.runtime.onMessage.addListener(onOffscreenMessage);
  await initWorker();
}
