import {
  ServerMessage,
  PopupServerMethod,
  type ServerPayload,
  ContentServerMethod,
} from "../../../common/types/message";

export interface IPopupServer {
  // initPassword: (params: { password: string }) => Promise<string>;
}

export interface IContentServer {
  connect: (params: any) => Promise<any>;
}

export async function executeServerMethod<T>(
  promise: Promise<T>
): Promise<ServerPayload<T>> {
  return await promise
    .then((data) => ({
      error: null,
      data,
    }))
    .catch((error) => ({
      error: error.message,
      data: null,
    }));
}
