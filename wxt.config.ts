import path from "node:path";
import { defineConfig } from "wxt";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import manifest from "./manifest";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "app",
  entrypointsDir: "../entrypoints",
  outDir: "dist",
  publicDir: "public",
  manifestVersion: 3,
  imports: false,
  manifest: () => manifest,
  alias: {
    "@": path.resolve("app"),
    core: path.resolve("core"),
    aleo: path.resolve("aleo"),
  },
  vite: ({ mode }) => ({
    build: {
      target: "chrome120",
      assetsInlineLimit: 0,
      commonjsOptions: { transformMixedEsModules: true },
      minify: mode === "production",
    },
    worker: { format: "es" },
    optimizeDeps: {
      // Keep dependency discovery scoped to the WXT entrypoints.
      entries: ["entrypoints/**/*.html", "entrypoints/*.{ts,tsx}"],
      exclude: ["provable-wasm-no-tla", "@provablehq/wasm"],
      // Workers are not reliably discovered by the HTML dependency scan.
      // Prebundle the SDK and its CommonJS JSON polyfill, leaving WASM's
      // URLs and top-level initialization in the excluded ESM package.
      include: ["@provablehq/sdk/mainnet.js"],
    },
    esbuild: {
      pure: mode === "production" ? ["console.log", "console.debug"] : [],
      jsxInject: "import React from 'react'",
    },
    resolve: {
      alias: { "axios/lib": path.resolve("node_modules/axios/lib") },
      dedupe: ["@provablehq/sdk", "@provablehq/wasm", "provable-wasm-no-tla"],
    },
    plugins: [
      svgr({ exportAsDefault: true }),
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
      }),
    ],
  }),
});
