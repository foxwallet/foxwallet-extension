import { type TxHistoryPaginationParam } from "core/types/Pagination";
import { type TokenV2 } from "core/types/Token";

export type FilForwarderTxParams = {
  from: string;
  to: Buffer;
  value?: bigint;
};

export type InteractiveTokenParams = {
  address: string;
};

export type TokenTxHistoryParams = {
  address: string;
  token: TokenV2;
  pagination: TxHistoryPaginationParam;
};
