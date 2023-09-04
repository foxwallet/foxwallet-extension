import { KEEP_ALIVE_INTERVAL } from "../constants";
import { MessageType } from "../types/message";
import { PortName } from "../types/port";
import { logger } from "./logger";
import { IPort, Port } from "./port";

export type CallOpt = {
  auth?: boolean;
};

export interface IClient {
  connect(): void | Promise<void>;
}

// client to connect background client
export class KeepAliveClient implements IClient {
  private port: IPort;
  private timer?: number;

  constructor(private portName: PortName) {
    this.connect();
  }

  connect(): void | Promise<void> {
    this.port = new Port({ name: PortName.KEEP_ALIVE });
    this.port.onDisconnect.addListener(() => {
      // reconnect
      this.connect();
    });
    this.report();
  }

  report() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.timer = setTimeout(() => {
      try {
        this.port.postMessage({
          type: MessageType.KEEP_ALIVE,
          payload: {
            portName: PortName.KEEP_ALIVE,
            from: this.portName,
          },
        });
      } catch (err) {
        logger.error("Send keep alive message failed");
      }
      this.report();
    }, KEEP_ALIVE_INTERVAL);
  }
}
