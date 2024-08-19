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
    private readonly portName: PortName,
  ) {}

  connect(): void {
    console.log(this.portName, " addListener ");
    browser.runtime.onConnect.addListener((port: IPort) => {
      if (port.name !== this.portName) {
        logger.error(
          port.name,
          " background connect wrong port ",
          this.portName,
        );
        return;
      }
      console.log(port.name, " background connect ");
      this.handler.handle(port)?.catch((err) => {
        logger.error("Handle port error ", err.message);
      });
    });
  }
}
