import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
// @ts-ignore
import manifest from "./manifest";
import viteSvgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import wasmPack from "vite-plugin-wasm-pack";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: "es2020",
    commonjsOptions: {
      // https://github.com/originjs/vite-plugins/issues/9#issuecomment-924668456
      transformMixedEsModules: true,
    },
    // minify: mode === "production",
    minify: false,
    rollupOptions: {
      input: {
        offscreen: "./offscreen.html",
        // offscreen_tx: "./offscreen_tx.html",
      },
      output: {
        entryFileNames: "[name].js",
        format: "esm",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      define: {
        global: "globalThis",
      },
    },
    exclude: [],
  },
  esbuild: {
    pure:
      mode === "production" ? ["console.log", "console.debug", "debugger"] : [],
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "app") },
      { find: "core", replacement: path.resolve(__dirname, "core") },
      { find: "aleo", replacement: path.resolve(__dirname, "aleo") },
    ],
  },
  define: {},
  plugins: [
    tsconfigPaths(),
    viteSvgr({
      exportAsDefault: true,
    }),
    nodePolyfills({
      exclude: [],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    react(),
    wasmPack(["./aleo_wasm"]),
    crx({ manifest }),
  ],
}));
