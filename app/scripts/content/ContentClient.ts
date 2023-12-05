import { MessageType, ServerMessage, ServerResp } from "@/common/types/message";
import { PortName } from "@/common/types/port";
import { IClient } from "@/common/utils/client";
import { IPort, Port } from "@/common/utils/port";
import {
  ConnectProps,
  ContentServerMethod,
  DecrtptProps,
  RequestBulkTxsProps,
  RequestBulkTxsResp,
  RequestDeployProps,
  RequestDeployResp,
  RequestFinfishProps,
  RequestRecordsPlaintextResp,
  RequestRecordsProps,
  RequestRecordsResp,
  RequestTxHistoryProps,
  RequestTxHistoryResp,
  RequestTxProps,
  RequestTxResp,
  SignMessageProps,
  SignMessageResp,
  TransactionStatusProps,
  TransactionStatusResp,
} from "../background/servers/IWalletServer";
import { nanoid } from "nanoid";
import { SiteInfo } from "./host";

export class ContentClient implements IClient {
  private port: IPort;
  private callbackMap: Map<string, (error: string | null, data: any) => void>;

  constructor() {
    this.callbackMap = new Map();
    this._connect();
  }

  _connect(): void {
    this.port = new Port({ name: PortName.CONTENT_TO_BACKGROUND });
    this.port.onMessage.addListener(this.#onMessage.bind(this));
    this.port.onDisconnect.addListener(() => {
      console.warn("ContentClient disconnected, try to reconnect");
      Object.values(this.callbackMap).forEach((callback) => {
        callback(new Error("PopupServerClient disconncected"));
      });
      this.callbackMap = new Map();
      this._connect();
    });
  }

  // connect = (params: ConnectProps): Promise<string | null> => {
  //   return this.send("connect", params);
  // };

  // disconnect = (): Promise<boolean> => {
  //   return this.send("disconnect", {});
  // };

  // decrypt = (params: DecrtptProps): Promise<string> => {
  //   return this.send("decrypt", params);
  // };

  // requestRecords = (
  //   params: RequestRecordsProps,
  // ): Promise<RequestRecordsResp> => {
  //   return this.send("requestRecords", params);
  // };

  // requestRecordPlaintexts = (
  //   params: RequestRecordsProps,
  // ): Promise<RequestRecordsPlaintextResp> => {
  //   return this.send("requestRecordPlaintexts", params);
  // };

  // requestTransaction = (params: RequestTxProps): Promise<RequestTxResp> => {
  //   return this.send("requestTransaction", params);
  // };

  // signMessage = (params: SignMessageProps): Promise<SignMessageResp> => {
  //   return this.send("signMessage", params);
  // };

  // requestExecution = (params: RequestTxProps): Promise<RequestTxResp> => {
  //   return this.send("requestExecution", params);
  // };

  // requestBulkTransactions = (
  //   params: RequestBulkTxsProps,
  // ): Promise<RequestBulkTxsResp> => {
  //   return this.send("requestBulkTransactions", params);
  // };

  // requestDeploy = (params: RequestDeployProps): Promise<RequestDeployResp> => {
  //   return this.send("requestDeploy", params);
  // };

  // transactionStatus = (
  //   params: TransactionStatusProps,
  // ): Promise<TransactionStatusResp> => {
  //   return this.send("transactionStatus", params);
  // };

  // getExecution = (
  //   params: TransactionStatusProps,
  // ): Promise<TransactionStatusResp> => {
  //   return this.send("getExecution", params);
  // };

  // requestTransactionHistory = (
  //   params: RequestTxHistoryProps,
  // ): Promise<RequestTxHistoryResp> => {
  //   return this.send("requestTransactionHistory", params);
  // };

  #onMessage(msg: ServerResp) {
    const { id, payload } = msg;
    const callback = this.callbackMap.get(id);
    if (callback) {
      const { error, data } = payload;
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
      this.callbackMap.delete(id);
    }
  }

  async send<T>(method: ContentServerMethod, payload: T, siteInfo: SiteInfo) {
    return await new Promise<{ error: string | null; data: any }>(
      (resolve, reject) => {
        const id = nanoid();
        const message: ServerMessage = {
          type: MessageType.REQUEST,
          id,
          origin: PortName.CONTENT_TO_BACKGROUND,
          method,
          payload,
          siteInfo,
        };
        const callback = (error: string | null, data: any) => {
          resolve({ error, data });
        };
        this.callbackMap.set(id, callback);
        this.port.postMessage(message);
      },
    );
  }
}
