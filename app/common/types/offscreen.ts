export enum MessageOrigin {
  OFFSCREEN_TO_BACKGROUND = "offscreen_to_background",
  OFFSCREEN_TX_TO_BACKGROUND = "offscreen_tx_to_background",
  BACKGROUND_TO_OFFSCREEN = "background_to_offscreen",
  BACKGROUND_TO_OFFSCREEN_TX = "background_to_offscreen_tx",
}

export interface OffscreenMessagePayload<T = any> {
  error: null | string;
  data: T | null;
}

export enum OffscreenMessageType {
  ERROR = "error",
  RESPONSE = "response",
}

export interface OffscreenMessage<T = any> {
  type: OffscreenMessageType;
  origin: MessageOrigin;
  payload: OffscreenMessagePayload<T>;
}

export enum OffscreenMethod {
  INIT_WORKER = "init_worker",
  SEND_TX = "send_tx",
}

export interface BackgroundMessage<T = any> {
  type: OffscreenMethod;
  origin: MessageOrigin;
  payload: T;
}
