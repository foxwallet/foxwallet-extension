import { get, post } from "@/common/utils/request";
import { SyncResp } from "./sync.di";
import { AleoTransactionWithHeight } from "../../types/Transaction";
import {
  AleoBaseFeeResp,
  AleoFaucetContentResp,
  AleoFaucetStatusResp,
  AleoPriorityFeeResp,
  AleoRequestFaucetResp,
} from "./api.di";
import { AleoCreditMethod } from "../../types/TransferMethod";

const FAUCET_TYPE = "1001";

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

  async postData<Type>(
    url = "/",
    body: any,
    headers: Record<string, string>,
  ): Promise<Type> {
    const response = await post(`${this.host}/${this.chainId}${url}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...headers,
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
        blockTime: item.block_time * 1000,
        transactionIndex: item.transaction_index,
        transactionId: item.transaction_id,
        transitionId: item.transition_id,
        feeFutureValue: item.fee_future_value,
        feeValue: item.fee_value,
        feeAddress: item.fee_address,
        createTime: item.create_time * 1000,
        executionTransitionId: item.execution_transition_id,
        executionProgram: item.execution_program,
        executionFunction: item.execution_function,
        executionFutureValue: item.execution_future_value,
        executionValue: item.execution_value,
      };
    });
  }

  async getTransaction(id: string) {
    const resp = await this.fetchData<AleoTransactionWithHeight>(
      `/transaction/${id}`,
    );
    return {
      ...resp,
      timestamp: resp.timestamp * 1000,
    };
  }

  async getFaucetContent(_params: { address: string }) {
    const res = await this.fetchData<AleoFaucetContentResp>(
      `/faucet?type=${FAUCET_TYPE}`,
    );
    if (res.status !== 0 || !res.data) {
      throw new Error(res.msg);
    }
    return res.data;
  }

  async requestFaucet({
    address,
    message,
    signature,
  }: {
    address: string;
    message: string;
    signature: string;
  }) {
    const res = await this.postData<AleoRequestFaucetResp>(
      `/faucet`,
      {
        type: FAUCET_TYPE,
        address,
        message,
        create_time: Number(JSON.parse(message).timestamp),
      },
      {
        "x-sig-faucet": signature,
      },
    );
    console.log("===> requestFaucet: ", res);
    if (res.status !== 0 || !res.data) {
      throw new Error(res.msg);
    }
    return res.data;
  }

  async getFaucetStatus({ address }: { address: string }) {
    const resp = await this.fetchData<AleoFaucetStatusResp>(
      `/faucet/status?type=${FAUCET_TYPE}&addr=${address}`,
    );
    if (resp.status !== 0 || !resp.data) {
      throw new Error(resp.msg);
    }
    try {
      const txId = resp.data?.txid;
      if (txId) {
        const tx = await this.getTransaction(txId);
        if (tx.status === "accepted") {
          return {
            status: resp.data.status,
            txId,
          };
        }
      }
    } catch (err) {
      console.error("===> getFaucetStatus tx error: ", err);
    }
    return {
      status: resp.data.status,
    };
  }

  async getBaseFee(params: { txType: AleoCreditMethod }) {
    const { txType } = params;
    const res: AleoBaseFeeResp = await this.fetchData(
      `/gas?function=${txType}`,
    );
    if (res.status !== 0 || !res.data) {
      throw new Error(res.msg);
    }
    const num = BigInt(res.data.slice(0, -3));
    return num;
  }

  async getPriorityFee() {
    const resp = await this.fetchData<AleoPriorityFeeResp>(`/priority_fee`);
    if (resp.status !== 0 || !resp.data) {
      throw new Error("get priority fee error");
    }
    return resp.data.recommend;
  }
}
