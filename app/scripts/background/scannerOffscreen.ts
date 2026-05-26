import {
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessageType,
  type BackgroundMessage,
  type OffscreenMessage,
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "../../../offscreen_service/src/types";
import {
  OFFSCREEN_PATH,
  withOffscreen,
} from "./offscreenLock";

const SCANNER_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.WORKERS,
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const SCANNER_JUSTIFICATION =
  "Encrypt ViewKey registration request for Provable Record Scanner";
const SCANNER_READY_TIMEOUT_MS = 30 * 1000;
const SCANNER_READY_POLL_INTERVAL_MS = 200;

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

async function waitForScannerOffscreenReady(): Promise<void> {
  const timeoutAt = Date.now() + SCANNER_READY_TIMEOUT_MS;

  while (Date.now() < timeoutAt) {
    try {
      const message: BackgroundMessage<null> = {
        type: OffscreenMethod.SCANNER_PING,
        origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER,
        payload: null,
      };
      const resp = (await chrome.runtime.sendMessage(message)) as
        | OffscreenMessage<null>
        | undefined;
      if (resp?.type === OffscreenMessageType.RESPONSE) {
        return;
      }
    } catch {
      // The offscreen document may exist before its listener is registered.
    }

    await sleep(SCANNER_READY_POLL_INTERVAL_MS);
  }

  throw new Error("scanner offscreen did not become ready in time");
}

export async function encryptRegistrationViaOffscreen(
  payload: ScannerEncryptRegistrationPayload,
): Promise<string> {
  return await withOffscreen(
    OFFSCREEN_PATH,
    SCANNER_REASONS,
    SCANNER_JUSTIFICATION,
    async () => {
      await waitForScannerOffscreenReady();
      const message: BackgroundMessage<ScannerEncryptRegistrationPayload> = {
        type: OffscreenMethod.SCANNER_ENCRYPT_REGISTRATION,
        origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_SCANNER,
        payload,
      };
      const resp = (await chrome.runtime.sendMessage(message)) as
        | OffscreenMessage<ScannerEncryptRegistrationResult>
        | undefined;

      if (
        !resp ||
        resp.type === OffscreenMessageType.ERROR ||
        resp.payload.error
      ) {
        const reason =
          resp?.payload?.error ?? "no response from scanner offscreen";
        throw new Error(`scanner encrypt failed: ${reason}`);
      }
      const ciphertext = resp.payload.data?.ciphertext;
      if (!ciphertext) {
        throw new Error("scanner encrypt returned empty ciphertext");
      }
      return ciphertext;
    },
  );
}
