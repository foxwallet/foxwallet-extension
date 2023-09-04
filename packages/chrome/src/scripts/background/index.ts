import { MessageType } from "../../common/types/message";
import { PortName } from "../../common/types/port";
import { Connection, IHandler } from "../../common/utils/connection";
import { logger } from "../../common/utils/logger";
import { IPort } from "../../common/utils/port";

const keepAliveHandler: IHandler = {
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

const keepAliveConnection = new Connection(
  keepAliveHandler,
  PortName.KEEP_ALIVE
);

keepAliveConnection.connect();
