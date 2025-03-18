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

type AleoInfoTransferHistoryResp = {
  transfer_count: number;
  transactions: TransferHistoryItem[];
  address_trunc?: string;
  address?: string;
};

type AleoInfoTransferHistoryRes = {
  transferCount: number;
  transactions: TransferHistoryItem[];
  addressTrunc?: string;
  address?: string;
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
  ): Promise<AleoInfoTransferHistoryRes> {
    console.log("getTransferHistory", address, limit, offset);
    const res: AleoInfoTransferHistoryResp = await this.reqInstance.get(
      `/transfer`,
      {
        params: {
          a: address,
          limit,
          offset,
          requestType: "fetch",
        },
      },
    );

    const ret: AleoInfoTransferHistoryRes =
      camelcaseKeys(res ?? {}, { deep: true }) ?? [];
    // console.log("      aleo ret", ret);
    return ret;
  }
}
