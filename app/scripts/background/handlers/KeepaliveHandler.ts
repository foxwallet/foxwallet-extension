import { MessageType } from "../../../common/types/message";
import { type IHandler } from "../../../common/utils/connection";
import { logger } from "../../../common/utils/logger";
import { type IPort } from "../../../common/utils/port";

export const keepAliveHandler: IHandler = {
  handle(port: IPort) {
    port.onMessage.addListener((msg) => {
      if (msg.type !== MessageType.KEEP_ALIVE) {
        return;
      }
      logger.log("BG keep alive message received: ", msg);
      port.postMessage({ type: MessageType.KEEP_ALIVE });
    });
  },
};
