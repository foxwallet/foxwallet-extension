import { ContentServerMethod } from "../background/servers/IWalletServer";

export interface CallbackParams {
  detail: {
    id: string;
    error?: string;
    data?: any;
  };
}

export interface RequestParams {
  id: string;
  method: ContentServerMethod;
  payload: any;
}
