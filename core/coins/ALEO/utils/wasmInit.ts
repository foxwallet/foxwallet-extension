import init from "provable-wasm-no-tla/mainnet.js";

let initPromise: Promise<unknown> | undefined;

export async function initAleoWasm(): Promise<unknown> {
  if (!initPromise) {
    // provable-wasm-no-tla's default export resolves the wasm URL relative
    // to its own bundled location, so callers don't need to forward a path.
    // We still wrap in a single-flight promise + reset-on-failure so a
    // transient fetch error doesn't permanently poison initialization.
    const p = init();
    initPromise = p.catch((err) => {
      initPromise = undefined;
      throw err;
    });
  }
  return initPromise;
}
