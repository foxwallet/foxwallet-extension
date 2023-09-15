import { type PortName } from "../types/port";
import { logger } from "./logger";
import { type IPort } from "./port";
import browser from "webextension-polyfill";

// Manage connection for Background
export interface IConnection {
  connect: () => void | Promise<void>;
}

export interface IHandler {
  handle: (port: IPort) => void | Promise<void>;
}

export class Connection implements IConnection {
  constructor(
    private readonly handler: IHandler,
    private readonly portName: PortName
  ) {}

  connect(): void {
    browser.runtime.onConnect.addListener((port: IPort) => {
      if (port.name !== this.portName) {
        logger.error(port.name, " connect wrong port ", this.portName);
        return;
      }
      this.handler.handle(port);
    });
  }
}
