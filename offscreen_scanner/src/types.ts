// Mirror of the scanner-related slice of offscreen_transaction/src/types.ts.
// Kept local so this rollup subproject does not need to reach outside its
// rootDir. Keep the enum string values in sync with the source file.

export enum MessageOrigin {
  OFFSCREEN_SCANNER_TO_BACKGROUND = "offscreen_scanner_to_background",
  BACKGROUND_TO_OFFSCREEN_SCANNER = "background_to_offscreen_scanner",
}

export enum OffscreenMessageType {
  ERROR = "error",
  RESPONSE = "response",
}

export enum OffscreenMethod {
  SCANNER_ENCRYPT_REGISTRATION = "scanner_encrypt_registration",
}

export interface OffscreenMessagePayload<T = any> {
  error: null | string;
  data: T | null;
}

export interface OffscreenMessage<T = any> {
  type: OffscreenMessageType;
  origin: MessageOrigin;
  payload: OffscreenMessagePayload<T>;
}

export interface BackgroundMessage<T = any> {
  type: OffscreenMethod;
  origin: MessageOrigin;
  payload: T;
}

export interface ScannerEncryptRegistrationPayload {
  publicKey: string;
  viewKey: string;
  start: number;
}

export interface ScannerEncryptRegistrationResult {
  ciphertext: string;
}
