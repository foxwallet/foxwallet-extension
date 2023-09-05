import { logger } from "./logger";
import browser from "webextension-polyfill";

export type IPort = browser.Runtime.Port;

// content and popup use Port to commuticate with background
export class Port implements IPort {
  private portName: string;
  private port: browser.Runtime.Port;
  private connected: boolean;
  private onConnect: (port: IPort) => void | Promise<void>;

  constructor(
    info: browser.Runtime.ConnectConnectInfoType,
    opts?: {
      onConnect?: (port: IPort) => void | Promise<void>;
    }
  ) {
    if (!info.name) {
      throw new Error("Need port name to identify port");
    }
    this.portName = info.name;
    this.onConnect = opts?.onConnect ?? (() => {});
    this.port = this.createPort();
  }

  private createPort() {
    const newPort = browser.runtime.connect({
      name: this.portName,
    });
    this.connected = true;
    logger.log(this.portName, " connected");
    newPort.onDisconnect.addListener(() => {
      this.connected = false;
      logger.log(this.portName, " disconnected");
    });
    this.onConnect(newPort);
    return newPort;
  }

  public postMessage(message: any) {
    if (!this.connected) {
      logger.log(this.portName, " reconnect...");
      this.port = this.createPort();
    }
    this.port.postMessage(message);
  }
  get disconnect() {
    return this.port.disconnect;
  }

  get sender() {
    return this.port.sender;
  }

  get onDisconnect() {
    return this.port.onDisconnect;
  }

  get onMessage() {
    return this.port.onMessage;
  }

  get name() {
    return this.port.name;
  }
}
