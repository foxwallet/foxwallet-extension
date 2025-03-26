import { ContentServerMethod } from "../background/servers/IWalletServer";
import { CoinType } from "core/types";

export interface CallbackParams {
  detail: {
    id: string;
    error?: string;
    data?: any;
  };
}
export interface EmitData {
  type: "EmitData";
  event: string;
  coinType: CoinType;
  data?: any;
}

export interface RequestParams<T extends CoinType> {
  id: string;
  coinType: T;
  method: ContentServerMethod<T>;
  payload: any;
  metadata: any;
}
