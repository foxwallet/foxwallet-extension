import { type AxiosInstance } from "axios";
import camelcaseKeys from "camelcase-keys";
import { createRequestInstance } from "@/common/utils/request";

export type TransferHistoryItem = {
  transitionId: string;
  transactionId: string;
  height: number;
  timestamp: number;
  transferFrom?: {
    address: string;
  };
  transferTo?: {
    address: string;
  };
  credits: number;
  state: string;
  programId: string;
  functionName: string;
};

export type TransferHistoryRes = {
  transferCount: number;
  transactions: TransferHistoryItem[];
};

export class AleoInfoApi {
  reqInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.reqInstance = createRequestInstance(baseUrl, 15000);
  }

  async getTransferHistory(
    address: string,
    offset: number,
    limit: number,
  ): Promise<TransferHistoryRes> {
    console.log("getTransferHistory", address, limit, offset);
    const res = await this.reqInstance.get(`/transfer`, {
      params: {
        a: address,
        limit,
        offset,
        requestType: "fetch",
      },
    });
    const ret: TransferHistoryRes =
      camelcaseKeys(res?.data ?? {}, { deep: true }) ?? [];
    return ret;
  }
}
