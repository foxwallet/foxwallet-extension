import init from "provable-wasm-no-tla/mainnet.js";

let initPromise: Promise<void> | undefined;
let aleoWasmReady = false;

export async function initAleoWasm(): Promise<void> {
  // The package patch resolves the versioned WASM from the extension root.
  // Share initialization across callers, and allow retry after a failed load.
  initPromise ??= init().then(
    () => {
      aleoWasmReady = true;
    },
    (error: unknown) => {
      initPromise = undefined;
      throw error;
    },
  );
  return initPromise;
}

export function assertAleoWasmReady(): void {
  if (!aleoWasmReady) {
    throw new Error("Aleo WASM is not initialized");
  }
}
