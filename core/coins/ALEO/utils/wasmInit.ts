import init from "provable-wasm-no-tla/mainnet.js";
import wasmUrl from "../../../../node_modules/provable-wasm-no-tla/dist/mainnet/aleo_wasm_mainnet_0.10.2.wasm?url";

let initPromise: Promise<unknown> | undefined;
let aleoWasmReady = false;

const ABSOLUTE_URL_RE = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

type AleoWasmInit = (options?: {
  module_or_path?: RequestInfo | URL | BufferSource | WebAssembly.Module;
}) => Promise<unknown>;

function resolveWasmUrl(): string {
  if (ABSOLUTE_URL_RE.test(wasmUrl) || wasmUrl.startsWith("data:")) {
    return wasmUrl;
  }
  if (wasmUrl.startsWith("/assets/") && globalThis.chrome?.runtime?.getURL) {
    return globalThis.chrome.runtime.getURL(wasmUrl.slice(1));
  }
  return new URL(wasmUrl, import.meta.url).toString();
}

async function initFromBundledWasm(): Promise<unknown> {
  const url = resolveWasmUrl();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Aleo WASM ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const bytes = await response.arrayBuffer();
  return await (init as AleoWasmInit)({ module_or_path: bytes });
}

export async function initAleoWasm(): Promise<unknown> {
  if (!initPromise) {
    // The default wasm-bindgen init resolves its WASM URL relative to the
    // bundled JS module. That URL is not reliable in MV3 popup/background dev
    // realms, so prefer Vite's explicit asset URL and only fall back to the
    // package init for non-Vite contexts.
    const p = initFromBundledWasm()
      .catch(async (err) => {
        console.warn(
          "[Aleo] bundled WASM init failed, retrying default init",
          err,
        );
        return await init();
      })
      .then((result) => {
        aleoWasmReady = true;
        return result;
      });
    initPromise = p.catch((err) => {
      initPromise = undefined;
      aleoWasmReady = false;
      throw err;
    });
  }
  return initPromise;
}

export function assertAleoWasmReady(): void {
  if (!aleoWasmReady) {
    throw new Error("Aleo WASM is not initialized");
  }
}
