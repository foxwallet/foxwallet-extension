import { MessageType } from "../../../common/types/message";
import { type IHandler } from "../../../common/utils/connection";
import { type IPort } from "../../../common/utils/port";

export const keepAliveHandler: IHandler = {
  handle(port: IPort) {
    port.onMessage.addListener((msg) => {
      if (msg.type !== MessageType.KEEP_ALIVE) {
        return;
      }
      port.postMessage({ type: MessageType.KEEP_ALIVE });
    });
  },
};
