import * as browser from "webextension-polyfill";
import {
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessageType,
  type BackgroundMessage,
  type OffscreenMessage,
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "./types.js";

// The SDK entry has a top-level `await __wbg_init(...)` that blocks module
// graph evaluation until the 9.4MB WASM is fetched and instantiated. If we
// imported it statically the `browser.runtime.onMessage.addListener` call
// below would not run until that init finished, and the background's
// SCANNER_PING would time out before we ever became reachable. Load it on
// demand instead so the listener registers synchronously at script start.
type SdkModule = typeof import("@provablehq/sdk/mainnet.js");
let sdkPromise: Promise<SdkModule> | undefined;
const loadSdk = async (): Promise<SdkModule> => {
  if (!sdkPromise) {
    sdkPromise = import("@provablehq/sdk/mainnet.js");
  }
  return await sdkPromise;
};

const respond = async (
  message: OffscreenMessage<ScannerEncryptRegistrationResult>,
): Promise<OffscreenMessage<ScannerEncryptRegistrationResult>> => message;

const handleEncrypt = async (
  payload: ScannerEncryptRegistrationPayload,
): Promise<OffscreenMessage<ScannerEncryptRegistrationResult>> => {
  try {
    const { ViewKey, encryptRegistrationRequest } = await loadSdk();
    const vk = ViewKey.from_string(payload.viewKey);
    const ciphertext = encryptRegistrationRequest(
      payload.publicKey,
      vk,
      payload.start,
    );
    return {
      type: OffscreenMessageType.RESPONSE,
      origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
      payload: { error: null, data: { ciphertext } },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      type: OffscreenMessageType.ERROR,
      origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
      payload: { error: msg, data: null },
    };
  }
};

// webextension-polyfill only treats a returned Promise (or sendResponse/true)
// as a response. Return undefined for unrelated messages so other listeners can
// handle them.
browser.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender: browser.Runtime.MessageSender,
  ):
    | Promise<OffscreenMessage<ScannerEncryptRegistrationResult>>
    | undefined => {
    if (message.origin !== MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER) {
      return undefined;
    }

    switch (message.type) {
      case OffscreenMethod.SCANNER_PING: {
        return respond({
          type: OffscreenMessageType.RESPONSE,
          origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
          payload: { error: null, data: null },
        });
      }
      case OffscreenMethod.SCANNER_ENCRYPT_REGISTRATION: {
        const payload =
          message.payload as ScannerEncryptRegistrationPayload | null;
        if (!payload) {
          return respond({
            type: OffscreenMessageType.ERROR,
            origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
            payload: { error: "missing payload", data: null },
          });
        }
        return handleEncrypt(payload);
      }
      default: {
        return respond({
          type: OffscreenMessageType.ERROR,
          origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
          payload: {
            error: `unexpected method ${message.type}`,
            data: null,
          },
        });
      }
    }
  },
);

// Kick off SDK load asynchronously so the first real encrypt request doesn't
// pay the full 9.4MB WASM init cost on the critical path. The listener is
// already registered above, so SCANNER_PING can be answered immediately.
void loadSdk().catch((error) => {
  console.error("[offscreen_scanner] SDK preload failed", error);
});
