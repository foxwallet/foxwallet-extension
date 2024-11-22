import { get, post } from "@/common/utils/request";
import {
  RecordFileInfo,
  RecordRawInfo,
  RecordTrimInfo,
  SyncResp,
} from "./sync.di";
import { RecordDetail, RecordTrimDetail } from "../../types/SyncTask";

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
  async getRecordFile(index: number): Promise<RecordFileInfo | undefined> {
    const info = await this.fetchData<SyncResp<RecordFileInfo>>(
      `/file/records?index=${index}`,
    );
    if (info.status === 404) {
      return undefined;
    }
    if (info.status !== 0) {
      throw new Error(info.msg);
    }
    return info.data;
  }

  /**
   * Returns the next 5000 record after the specified index
   *
   * @param {number} start
   */
  async getRecords(index: number): Promise<RecordRawInfo[]> {
    const recordFileInfo = await this.getRecordFile(index);
    if (recordFileInfo?.file_path) {
      const resp = await fetch(recordFileInfo.file_path);
      if (resp.ok) {
        return await resp.json();
      }
    } else {
      const info = await this.fetchData<SyncResp<RecordRawInfo[]>>(
        `/db/records?start=${index}`,
      );
      if (info.status !== 0) {
        throw new Error(info.msg);
      }
      return info.data;
    }
    return [];
  }

  async getTrimRecords(index: number): Promise<RecordTrimInfo[]> {
    const recordFileInfo = await this.getRecordFile(index);
    if (recordFileInfo?.trim_file_path) {
      const resp = await fetch(recordFileInfo.trim_file_path);
      if (resp.ok) {
        return await resp.json();
      }
    } else {
      const info = await this.fetchData<SyncResp<RecordTrimInfo[]>>(
        `/db/trim/records?start=${index}`,
      );
      if (info.status !== 0) {
        throw new Error(info.msg);
      }
      return info.data;
    }
    return [];
  }

  async getTrimRecordsInfo(
    records: Array<RecordTrimDetail>,
  ): Promise<Array<RecordDetail>> {
    const info = await this.postData<SyncResp<RecordRawInfo[]>>(
      `/records/info`,
      records.map((item) => ({
        a: item.height,
        b: item.commitment,
      })),
    );
    if (info.status !== 0) {
      throw new Error(info.msg);
    }
    const recordMap: { [commitment: string]: RecordRawInfo } = {};
    info.data.forEach((item) => {
      recordMap[item.commitment] = item;
    });
    return records
      .map((item) => {
        const recordInfo = recordMap[item.commitment];
        if (!recordInfo) return item;

        return {
          ...item,
          programId: recordInfo.transition_program,
          functionName: recordInfo.transition_function,
          transactionId: recordInfo.transaction_id,
          transitionId: recordInfo.transition_id,
          timestamp: recordInfo.block_time,
        };
      })
      .filter((item) => !!(item as RecordDetail).programId) as Array<
      RecordDetail & { address: string }
    >;
  }

  // /**
  //  * Returns latest record index
  //  *
  //  */
  // async getLatestRecordIndex(): Promise<number> {
  //   const info = await this.fetchData<SyncResp<number>>("/sync/latest/record");
  //   if (info.status !== 0) {
  //     throw new Error(info.msg);
  //   }
  //   return info.data;
  // }

  /**
   * Returns the unspent record tags from the specified list of tags
   *
   * @example
   * const latestHeight = networkClient.getLatestBlock();
   */
  async getSpentTags(tags: string[]): Promise<string[]> {
    if (tags.length === 0) {
      return [];
    }
    const resp = await this.postData<SyncResp<{ spent: string[] }>>(
      `/check/tags`,
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
