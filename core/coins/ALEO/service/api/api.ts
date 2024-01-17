import { get, post } from "@/common/utils/request";
import { SyncResp } from "./sync.di";
import { AleoTransaction } from "../../types/Transaction";

export class AleoWalletApi {
  host: string;
  chainId: string;

  constructor(config: { host: string; chainId: string }) {
    const { host, chainId } = config;
    this.host = host;
    this.chainId = chainId;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  async fetchData<Type>(url = "/"): Promise<Type> {
    const response = await get(`${this.host}/${this.chainId}${url}`);
    if (!response.ok) {
      throw new Error(
        `get error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    return await response.json();
  }

  async postData<Type>(url = "/", body: any): Promise<Type> {
    const response = await post(`${this.host}/${this.chainId}${url}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `get error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    return await response.json();
  }

  async getPublicHistory(
    address: string,
    cursor?: string,
  ): Promise<
    {
      id: number;
      blockHeight: number;
      blockTime: number;
      transactionIndex: number;
      transactionId: string;
      transitionId: string;
      feeFutureValue: string;
      feeValue: string;
      feeAddress: string;
      createTime: number;
      executionTransitionId: string;
      executionProgram: string;
      executionFunction: string;
      executionFutureValue: string;
      executionValue: string;
    }[]
  > {
    const cursorStr = cursor !== undefined ? `&last_height=${cursor}` : "";
    const resp = await this.fetchData<
      SyncResp<
        {
          id: number;
          block_height: number;
          block_time: number;
          transaction_index: number;
          transaction_id: string;
          transition_id: string;
          fee_future_value: string;
          fee_value: string;
          fee_address: string;
          create_time: number;
          execution_transition_id: string;
          execution_program: string;
          execution_function: string;
          execution_future_value: string;
          execution_value: string;
        }[]
      >
    >(`/public/tx_history?addr=${address}${cursorStr}`);
    if (resp.status !== 0) {
      throw new Error(resp.msg);
    }
    return resp.data.map((item) => {
      return {
        id: item.id,
        blockHeight: item.block_height,
        blockTime: item.block_time,
        transactionIndex: item.transaction_index,
        transactionId: item.transaction_id,
        transitionId: item.transition_id,
        feeFutureValue: item.fee_future_value,
        feeValue: item.fee_value,
        feeAddress: item.fee_address,
        createTime: item.create_time,
        executionTransitionId: item.execution_transition_id,
        executionProgram: item.execution_program,
        executionFunction: item.execution_function,
        executionFutureValue: item.execution_future_value,
        executionValue: item.execution_value,
      };
    });
  }

  async getTransaction(id: string) {
    const resp = await this.fetchData<{
      height: number;
      status: "accepted" | "rejected" | -1;
      timestamp: number;
      origin_data: AleoTransaction;
    }>(`/transaction/${id}`);
    return resp;
  }
}
