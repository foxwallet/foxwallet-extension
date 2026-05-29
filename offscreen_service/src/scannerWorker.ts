import {
  ViewKey,
  encryptRegistrationRequest,
} from "@provablehq/sdk/mainnet.js";
import {
  type ScannerEncryptRegistrationPayload,
  type ScannerEncryptRegistrationResult,
} from "./types";

type ScannerWorkerTask = {
  id: number;
  type: "encryptRegistration";
  payload: ScannerEncryptRegistrationPayload;
};

type ScannerWorkerResponse = {
  id: number;
  error: string | null;
  data: ScannerEncryptRegistrationResult | null;
};

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function postResult(message: ScannerWorkerResponse): void {
  postMessage(message);
}

function encryptRegistration(
  payload: ScannerEncryptRegistrationPayload,
): ScannerEncryptRegistrationResult {
  const viewKey = ViewKey.from_string(payload.viewKey);
  const ciphertext = encryptRegistrationRequest(
    payload.publicKey,
    viewKey,
    payload.start,
  );
  return { ciphertext };
}

function handleTask(task: ScannerWorkerTask): void {
  try {
    postResult({
      data: encryptRegistration(task.payload),
      error: null,
      id: task.id,
    });
  } catch (err) {
    postResult({
      data: null,
      error: toErrorMessage(err),
      id: task.id,
    });
  }
}

addEventListener("message", (event: MessageEvent<ScannerWorkerTask>) => {
  handleTask(event.data);
});

// The @provablehq/sdk import runs a top-level await that compiles the Aleo
// WASM; ESM settles it before this module body, so reaching here means both
// the WASM is ready and the listener above is attached. Signal readiness so
// the host doesn't postMessage before the listener exists (Workers drop such
// messages, which would hang the encrypt request forever).
postMessage({ type: "ready" });
