import type { UTXO, QtumBalance } from "../../types";
import { MATURE_CONFIRMATIONS } from "../../constants";
import { createRequestInstance } from "@/common/utils/request";
import { type AxiosInstance } from "axios";

const QTUM_INFO_APPLICATION_ID = "gate-55ed6e22-aa20-4bd8-95db-1fa32324d1db";

export interface QtumInfoTxResponse {
  id: string;
  hash: string;
  version: number;
  lockTime?: number;
  blockHash?: string;
  inputs: Array<{
    prevTxId: string;
    outputIndex: number;
    value: string;
    address: string;
  }>;
  outputs: Array<{
    value: string;
    address: string;
    isRefund?: boolean;
    receipt?: {
      sender?: string;
      gasUsed?: number;
      contractAddress?: string;
    };
    scriptPubKey: {
      type: string;
      hex: string;
    };
  }>;
  blockHeight: number;
  confirmations: number;
  timestamp: number;
  inputValue?: string;
  outputValue?: string;
  refundValue?: string;
  fees: string;
  weight?: number;
  qrc20TokenTransfers?: Array<{
    address?: string;
    addressHex?: string;
    name: string;
    symbol: string;
    decimals: number;
    contractAddress?: string;
    from: string;
    to: string;
    value: string;
  }>;
}

export interface QtumInfoBasicTxResponse {
  totalCount: number;
  transactions: Array<{
    id: string;
    blockHeight: number;
    blockHash: string;
    timestamp: number;
    confirmations: number;
    amount: string;
    inputValue: string;
    outputValue: string;
    refundValue: string;
    fees: string;
    type: string;
  }>;
}

export interface QtumInfoTxIdsResponse {
  totalCount: number;
  transactions: string[];
}

export interface QtumInfoAddressResponse {
  balance: string;
  totalReceived: string;
  totalSent: string;
  unconfirmed: string;
  staking: string;
  mature: string;
  qrc20Balances: Array<{
    address: string;
    addressHex: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
  }>;
  ranking: number;
  transactionCount: number;
  blocksMined: number;
}

export interface QtumInfoUTXOItem {
  transactionId: string;
  outputIndex: number;
  scriptPubKey: string;
  value: string;
  address: string;
  isStake: boolean;
  blockHeight: number;
  confirmations: number;
}

export interface QtumInfoChainInfo {
  height: number;
  supply: number;
  circulatingSupply: number;
  netStakeWeight: number;
  feeRate: number;
  dgpInfo: {
    maxBlockSize: number;
    minGasPrice: number;
    blockGasLimit: number;
  };
}

export interface QtumInfoFeeRate {
  feeRate: number | string;
}

export class QtumInfoApi {
  private requestInstance: AxiosInstance;

  constructor(baseUrl: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    this.requestInstance = createRequestInstance(
      normalizedBaseUrl,
      5000,
      this.getHeaders(normalizedBaseUrl),
    );
  }

  private shouldSendApplicationId(baseUrl: string): boolean {
    try {
      const { hostname } = new URL(baseUrl);
      return hostname === "qtum.info" || hostname.endsWith(".qtum.info");
    } catch {
      return false;
    }
  }

  private getHeaders(baseUrl: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.shouldSendApplicationId(baseUrl)) {
      headers["Application-Id"] = QTUM_INFO_APPLICATION_ID;
    }

    return headers;
  }

  async getAddressInfo(address: string): Promise<QtumInfoAddressResponse> {
    return this.requestInstance.get(`/address/${address}`);
  }

  async getBalance(address: string): Promise<QtumBalance> {
    const info = await this.getAddressInfo(address);
    return {
      balance: info.balance,
      availableBalance: info.mature || info.balance,
      unconfirmedBalance: info.unconfirmed,
    };
  }

  async getUTXOs(address: string): Promise<UTXO[]> {
    const utxos: QtumInfoUTXOItem[] = await this.requestInstance.get(
      `/address/${address}/utxo`,
    );
    return utxos
      .filter((utxo) => {
        // Filter immature staking UTXOs
        return !(utxo.isStake && utxo.confirmations < MATURE_CONFIRMATIONS);
      })
      .map((utxo) => ({
        txid: utxo.transactionId,
        vout: utxo.outputIndex,
        value: utxo.value,
        address: utxo.address || address,
        confirmations: utxo.confirmations,
        isStake: utxo.isStake,
        height: utxo.blockHeight,
      }));
  }

  async getTransaction(txid: string): Promise<QtumInfoTxResponse> {
    return this.requestInstance.get(`/tx/${txid}`);
  }

  async getTransactions(txids: string[]): Promise<QtumInfoTxResponse[]> {
    if (txids.length === 0) {
      return [];
    }
    return this.requestInstance.get(`/txs/${txids.join(",")}`);
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.requestInstance.get(`/raw-tx/${txid}`);
  }

  async getTransactionHistory(
    address: string,
    page = 0,
    pageSize = 20,
  ): Promise<QtumInfoBasicTxResponse> {
    return this.requestInstance.get(`/address/${address}/basic-txs`, {
      params: {
        page,
        pageSize,
      },
    });
  }

  async getTransactionIds(
    address: string,
    page = 0,
    pageSize = 20,
  ): Promise<QtumInfoTxIdsResponse> {
    return this.requestInstance.get(`/address/${address}/txs`, {
      params: {
        limit: pageSize,
        offset: page * pageSize,
      },
    });
  }

  async getChainInfo(): Promise<QtumInfoChainInfo> {
    return this.requestInstance.get(`/info`);
  }

  async getFeeRates(): Promise<QtumInfoFeeRate[]> {
    return this.requestInstance.get(`/feerates`);
  }

  async getFeeRate(): Promise<number> {
    const feeRates = await this.getFeeRates();
    const feeRate = Number(feeRates[0]?.feeRate);
    if (!Number.isFinite(feeRate) || feeRate <= 0) {
      throw new Error("Invalid QTUM fee rate");
    }

    // QtumInfo returns QTUM/kB. Convert it to sat/vB.
    return Math.ceil(feeRate * 1e5);
  }

  async sendRawTransaction(rawtx: string): Promise<{ id: string }> {
    const response: { id: string; status?: number; message?: string } =
      await this.requestInstance.post(`/tx/send`, { rawtx });
    if (response.status !== undefined && response.status !== 0) {
      throw new Error(response.message);
    }
    return response;
  }

  async getQRC20TokenInfo(contractAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    return this.requestInstance.get(`/qrc20/${contractAddress}`);
  }

  async getQRC20Transfers(
    address: string,
    contractAddress: string,
    page = 0,
    pageSize = 20,
  ): Promise<{
    totalCount: number;
    transactions: Array<{
      transactionId: string;
      blockHeight: number;
      timestamp: number;
      confirmations: number;
      from: string;
      to: string;
      value: string;
    }>;
  }> {
    return this.requestInstance.get(
      `/address/${address}/qrc20-txs/${contractAddress}`,
      {
        params: {
          limit: pageSize,
          offset: page * pageSize,
        },
      },
    );
  }
}
