import { AleoDeployment } from "core/coins/ALEO/types/Deployment";
import { TransactionParam } from "../background/servers/IWalletServer";
import { BaseProvider } from "./BaseProvider";
import { DecryptPermission } from "../background/types/permission";
import { hexToUint8Array, uint8ArrayToHex } from "@/common/utils/buffer";

export class AleoProvider extends BaseProvider {
  #publicKey: string | null;
  #network: string | null;

  constructor() {
    super();
    this.#publicKey = null;
    this.#network = null;
  }

  get publicKey() {
    return this.#publicKey;
  }

  get network() {
    return this.#network;
  }

  async connect(
    decryptPermission: DecryptPermission,
    network: string,
    programs?: string[],
  ) {
    const address = await this.send<string>("connect", {
      decryptPermission,
      network,
      programs,
    });
    this.#publicKey = address ? address : null;
    this.#network = network;
    return !!address;
  }

  async disconnect(): Promise<boolean | undefined> {
    if (!this.#publicKey || !this.network) {
      throw new Error("Connect before disconnect");
    }
    const result = await this.send<boolean>("disconnect", {
      address: this.#publicKey,
      network: this.network,
    });
    this.#publicKey = null;
    this.#network = null;
    return result;
  }

  async decrypt(
    cipherText: string,
    tpk?: string,
    programId?: string,
    functionName?: string,
    index?: number,
  ) {
    return await this.send("decrypt", {
      cipherText,
      tpk,
      programId,
      functionName,
      index,
    });
  }

  async requestRecords(program: string) {
    return await this.send("requestRecords", { program });
  }

  async requestTransaction(transaction: TransactionParam) {
    return await this.send("requestTransaction", { transaction });
  }

  async requestExecution(transaction: TransactionParam) {
    return await this.send("requestExecution", { transaction });
  }

  async requestBulkTransactions(transactions: TransactionParam[]) {
    return await this.send("requestBulkTransactions", { transactions });
  }

  async requestDeploy(deployment: AleoDeployment) {
    return await this.send("requestDeploy", { deployment });
  }

  async transactionStatus(transactionId: string) {
    return await this.send("transactionStatus", { transactionId });
  }

  async getExecution(transactionId: string) {
    return await this.send("getExecution", { transactionId });
  }

  async requestRecordPlaintexts(program: string) {
    return await this.send("requestRecordPlaintexts", { program });
  }

  async requestTransactionHistory(program: string) {
    return await this.send("requestTransactionHistory", { program });
  }

  async signMessage(message: Uint8Array) {
    const messageStr = uint8ArrayToHex(message);
    const res = await this.send<{ signature: string }>("signMessage", {
      message: messageStr,
    });
    if (!res) {
      throw new Error("sign message failed");
    }
    const signature = hexToUint8Array(res.signature);
    return { signature };
  }
}
