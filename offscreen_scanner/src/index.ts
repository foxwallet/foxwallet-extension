import * as browser from "webextension-polyfill";
import {
  encryptRegistrationRequest,
  ViewKey,
} from "@provablehq/sdk/mainnet.js";
import {
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessageType,
  type BackgroundMessage,
  type OffscreenMessage,
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "./types.js";

const respond = (
  message: OffscreenMessage<ScannerEncryptRegistrationResult>,
): Promise<OffscreenMessage<ScannerEncryptRegistrationResult>> =>
  Promise.resolve(message);

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
        try {
          const vk = ViewKey.from_string(payload.viewKey);
          const ciphertext = encryptRegistrationRequest(
            payload.publicKey,
            vk,
            payload.start,
          );
          return respond({
            type: OffscreenMessageType.RESPONSE,
            origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
            payload: { error: null, data: { ciphertext } },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return respond({
            type: OffscreenMessageType.ERROR,
            origin: MessageOrigin.OFFSCREEN_SCANNER_TO_BACKGROUND,
            payload: { error: msg, data: null },
          });
        }
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
