import { PortName } from "../types/port";
import { logger } from "./logger";
import { IPort } from "./port";

// Manage connection for Background
export interface IConnection {
  connect(): void | Promise<void>;
}

export interface IHandler {
  handle(port: IPort): void | Promise<void>;
}

export class Connection implements IConnection {
  constructor(private handler: IHandler, private portName: PortName) {}

  connect(): void {
    chrome.runtime.onConnect.addListener((port: IPort) => {
      if (port.name !== this.portName) {
        logger.error(port.name, " connect wrong port ", this.portName);
        return;
      }
      this.handler.handle(port);
    });
  }
}
