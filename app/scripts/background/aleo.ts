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

// export async function main() {
//   await init();
//   const worker = new AleoWorker(["https://dev.foxnb.net/api/v1/aleo"]);
//   const resp = await worker.syncBlocks({
//     viewKey: "AViewKey1cYH2yRXZnF8zA7BkvJEbb1jvbkjWwg6o62gL2Lkcu87y",
//     begin: 240071,
//     end: 240073,
//   });
//   console.log("===> resp: ", resp);
// }

const onOffscreenMessage = (
  message: OffscreenMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (data: any) => void,
) => {
  if (message.origin !== MessageOrigin.OFFSCREEN_TO_BACKGROUND) {
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
  setTimeout(async () => {
    await sendTransaction();
  });
}
