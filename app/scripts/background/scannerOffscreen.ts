import {
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessageType,
  type BackgroundMessage,
  type OffscreenMessage,
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "../../../offscreen_transaction/src/types";
import { getTxInFlight } from "./offscreen";
import {
  OFFSCREEN_SCANNER_PATH,
  closeOffscreen,
  withOffscreen,
} from "./offscreenLock";

// Upper bound on how long scanner will wait for an in-flight tx/deploy
// before giving up. 5 minutes covers the longest realistic deploy budget
// (prover key generation + broadcast). If we hit this, the tx is stuck;
// failing fast is better than hanging the caller forever.
const SCANNER_TX_WAIT_TIMEOUT_MS = 5 * 60 * 1000;

const SCANNER_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const SCANNER_JUSTIFICATION =
  "Encrypt ViewKey registration request for Provable Record Scanner";

export async function encryptRegistrationViaOffscreen(
  payload: ScannerEncryptRegistrationPayload,
): Promise<string> {
  const inFlight = getTxInFlight();
  if (inFlight) {
    console.log("[scanner-offscreen] waiting on in-flight tx");
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        inFlight.catch(() => {
          /* tx failures are not our concern */
        }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("timed out waiting for in-flight tx")),
            SCANNER_TX_WAIT_TIMEOUT_MS,
          );
        }),
      ]);
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  try {
    return await withOffscreen(
      OFFSCREEN_SCANNER_PATH,
      SCANNER_REASONS,
      SCANNER_JUSTIFICATION,
      async () => {
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
  } finally {
    try {
      await closeOffscreen(OFFSCREEN_SCANNER_PATH);
    } catch (e) {
      console.error("[scanner-offscreen] close failed", e);
    }
  }
}
