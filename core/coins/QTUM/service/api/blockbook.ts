import type { UTXO, QtumBalance } from "../../types";
import { createRequestInstance } from "@/common/utils/request";
import { type AxiosInstance } from "axios";

export interface BlockbookAddressResponse {
  page: number;
  totalPages: number;
  itemsOnPage: number;
  address: string;
  balance: string;
  totalReceived: string;
  totalSent: string;
  unconfirmedBalance: string;
  unconfirmedTxs: number;
  txs: number;
  txids?: string[];
}

export interface BlockbookUTXOItem {
  txid: string;
  vout: number;
  value: string;
  confirmations: number;
  height?: number;
  lockTime?: number;
}

export interface BlockbookTxResponse {
  txid: string;
  version: number;
  vin: Array<{
    txid: string;
    vout: number;
    sequence: number;
    addresses: string[];
    value: string;
  }>;
  vout: Array<{
    value: string;
    n: number;
    hex: string;
    addresses: string[];
  }>;
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  blockTime: number;
  fees: string;
  value: string;
  valueIn: string;
  hex?: string;
}

export class BlockbookApi {
  private reqInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.reqInstance = createRequestInstance(baseUrl.replace(/\/$/, ""));
  }

  async getAddressInfo(address: string): Promise<BlockbookAddressResponse> {
    return this.reqInstance.get(`/api/v2/address/${address}`);
  }

  async getBalance(address: string): Promise<QtumBalance> {
    const info = await this.getAddressInfo(address);
    return {
      balance: info.balance,
      availableBalance: info.balance, // Blockbook doesn't distinguish
      unconfirmedBalance: info.unconfirmedBalance,
    };
  }

  async getUTXOs(address: string): Promise<UTXO[]> {
    const utxos: BlockbookUTXOItem[] = await this.reqInstance.get(
      `/api/v2/utxo/${address}`,
    );
    return utxos.map((utxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      address,
      confirmations: utxo.confirmations,
      height: utxo.height,
    }));
  }

  async getTransaction(txid: string): Promise<BlockbookTxResponse> {
    return this.reqInstance.get(`/api/v2/tx/${txid}`);
  }

  async getRawTransaction(txid: string): Promise<string> {
    const tx = await this.getTransaction(txid);
    if (!tx.hex) {
      throw new Error("Blockbook transaction hex is unavailable");
    }
    return tx.hex;
  }

  async getFeeRate(): Promise<number> {
    const info: { result: string } = await this.reqInstance.get(
      `/api/v2/estimatefee/2`,
    );
    // Convert BTC/kB to sat/byte
    const feePerKb = parseFloat(info.result);
    return Math.ceil((feePerKb * 1e8) / 1000);
  }

  async sendRawTransaction(hex: string): Promise<{ result: string }> {
    return this.reqInstance.get(`/api/v2/sendtx/${hex}`);
  }
}
