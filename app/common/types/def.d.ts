import {
  type FOX_DAPP_EMIT,
  type FOX_DAPP_REQUEST,
  type FOX_DAPP_RESP,
} from "@/common/constants";

declare module "axios/lib/core/buildFullPath" {
  export default function buildFullPath(
    baseURL?: string,
    requestedURL: string,
  ): string;
}

declare global {
  interface WindowEventMap {
    [FOX_DAPP_RESP]: CustomEvent;
    [FOX_DAPP_REQUEST]: CustomEvent;
    [FOX_DAPP_EMIT]: CustomEvent;
  }
}
