import { get, post } from "@/common/utils/request";
import { RecordRawInfo, SyncResp } from "./sync.di";

export class AleoSyncApi {
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

  /**
   * Returns the next 5000 record after the specified index
   *
   * @param {number} start
   */
  async getRecords(
    index: number,
    start: number,
    end: number,
  ): Promise<RecordRawInfo[]> {
    const info = await this.fetchData<SyncResp<RecordRawInfo[]>>(
      `/sync/records?index=${index}&start=${start}&end=${end}`,
    );
    if (info.status !== 0) {
      throw new Error(info.msg);
    }
    return info.data;
  }

  /**
   * Returns latest record index
   *
   */
  async getLatestRecordIndex(): Promise<number> {
    const info = await this.fetchData<SyncResp<number>>("/sync/latest/record");
    if (info.status !== 0) {
      throw new Error(info.msg);
    }
    return info.data;
  }

  /**
   * Returns the unspent record tags from the specified list of tags
   *
   * @example
   * const latestHeight = networkClient.getLatestBlock();
   */
  async getSpentTags(tags: string[]): Promise<string[]> {
    const resp = await this.postData<SyncResp<{ spent: string[] }>>(
      `/sync/tags`,
      {
        tags,
      },
    );
    if (resp.status !== 0) {
      throw new Error(resp.msg);
    }
    return resp.data.spent;
  }

  async getNodeStatus(): Promise<{
    syncHeight: number;
    referenceHeight: number;
  }> {
    const resp =
      await this.fetchData<
        SyncResp<{ sync_height: number; reference_height: number }>
      >(`/height/status`);
    if (resp.status !== 0) {
      throw new Error(resp.msg);
    }
    return {
      syncHeight: resp.data.sync_height,
      referenceHeight: resp.data.reference_height,
    };
  }
}
