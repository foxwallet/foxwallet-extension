import init from "aleo_wasm_mainnet";

let initPromise: Promise<unknown> | undefined;

const DEV_WASM_URL =
  "http://localhost:5173/node_modules/aleo_wasm_mainnet/aleo_wasm_mainnet_bg.wasm";

function getExtensionWasmUrl(): string | undefined {
  if (!globalThis.chrome?.runtime?.getURL) {
    return undefined;
  }
  return globalThis.chrome.runtime.getURL("aleo_wasm_mainnet_bg.wasm");
}

export async function initAleoWasm(): Promise<unknown> {
  if (!initPromise) {
    const extensionWasmUrl = getExtensionWasmUrl();
    const p = extensionWasmUrl
      ? init(extensionWasmUrl)
      : import.meta.env.DEV
      ? init(DEV_WASM_URL)
      : init();
    initPromise = p.catch((err) => {
      initPromise = undefined;
      throw err;
    });
  }
  return initPromise;
}
