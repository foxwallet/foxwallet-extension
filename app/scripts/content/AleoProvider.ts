import { AleoDeployment } from "core/coins/ALEO/types/Deployment";
import {
  ContentServerMethod,
  TransactionParam,
} from "../background/servers/IWalletServer";
import { BaseProvider } from "./BaseProvider";
import { hexToUint8Array, uint8ArrayToHex } from "@/common/utils/buffer";
import { DecryptPermission } from "@/database/types/dapp";
import { CoinType } from "core/types";

export class AleoProvider extends BaseProvider {
  chain = CoinType.ALEO;
  #publicKey: string | null;
  #network: string | null;
  _readyState: string;

  constructor() {
    super();
    this.#publicKey = null;
    this.#network = null;
    this._readyState = "Installed";
  }

  get publicKey() {
    return this.#publicKey;
  }

  get network() {
    return this.#network;
  }

  get readyState() {
    return this._readyState;
  }

  convertNetworkToChainId(network: string) {
    switch (network) {
      case "testnetbeta": {
        return "testnet";
      }
      case "mainnetbeta": {
        return "mainnet";
      }
      case "mainnet": {
        return "mainnet";
      }
      default: {
        throw new Error("Unsupport network " + network);
      }
    }
  }

  async connect(
    decryptPermission: DecryptPermission,
    network: string,
    programs?: string[],
  ) {
    const chainId = this.convertNetworkToChainId(network);
    const address = await this.send<string>("connect", {
      decryptPermission,
      network: chainId,
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
    const result = await this.send<boolean>("disconnect", {});
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
    const encoder = new TextEncoder();
    const signature = encoder.encode(res.signature);
    return { signature };
  }

  send<T>(method: ContentServerMethod<CoinType.ALEO>, payload: any) {
    return super.send<T>(method, payload, {
      address: this.#publicKey,
      network: this.#network ? this.convertNetworkToChainId(this.#network) : "",
    });
  }
}
