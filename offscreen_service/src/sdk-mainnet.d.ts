declare module "@provablehq/sdk/mainnet.js" {
  export * from "@provablehq/sdk/dist/mainnet/browser";
}

declare module "provable-wasm-no-tla/mainnet.js" {
  export * from "provable-wasm-no-tla/dist/mainnet/aleo_wasm_mainnet_0.10.2";
  export function initThreadPool(threads?: number): Promise<void>;
  const initWasm: () => Promise<void>;
  export default initWasm;
}
