import type { UTXO, QtumBalance } from "../../types";
import { MATURE_CONFIRMATIONS } from "../../constants";

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

export class QtumInfoApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `QtumInfo API error: ${response.status} ${response.statusText}`,
      );
    }
    return response.json() as Promise<T>;
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(
        `QtumInfo API error: ${response.status} ${response.statusText}`,
      );
    }
    return response.json() as Promise<T>;
  }

  async getAddressInfo(address: string): Promise<QtumInfoAddressResponse> {
    return this.fetchJson<QtumInfoAddressResponse>(`/address/${address}`);
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
    const utxos = await this.fetchJson<QtumInfoUTXOItem[]>(
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
    return this.fetchJson<QtumInfoTxResponse>(`/tx/${txid}`);
  }

  async getTransactions(txids: string[]): Promise<QtumInfoTxResponse[]> {
    if (txids.length === 0) {
      return [];
    }
    return this.fetchJson<QtumInfoTxResponse[]>(`/txs/${txids.join(",")}`);
  }

  async getTransactionHistory(
    address: string,
    page = 0,
    pageSize = 20,
  ): Promise<QtumInfoBasicTxResponse> {
    return this.fetchJson<QtumInfoBasicTxResponse>(
      `/address/${address}/basic-txs?page=${page}&pageSize=${pageSize}`,
    );
  }

  async getTransactionIds(
    address: string,
    page = 0,
    pageSize = 20,
  ): Promise<QtumInfoTxIdsResponse> {
    return this.fetchJson<QtumInfoTxIdsResponse>(
      `/address/${address}/txs?limit=${pageSize}&offset=${page * pageSize}`,
    );
  }

  async getChainInfo(): Promise<QtumInfoChainInfo> {
    return this.fetchJson<QtumInfoChainInfo>(`/info`);
  }

  async getFeeRate(): Promise<number> {
    const info = await this.getChainInfo();
    return info.feeRate;
  }

  async sendRawTransaction(rawtx: string): Promise<{ id: string }> {
    return this.postJson<{ id: string }>(`/tx/send`, { rawtx });
  }

  async getQRC20TokenInfo(contractAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    return this.fetchJson(`/qrc20/${contractAddress}`);
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
    return this.fetchJson(
      `/address/${address}/qrc20-txs/${contractAddress}?limit=${pageSize}&offset=${
        page * pageSize
      }`,
    );
  }
}
