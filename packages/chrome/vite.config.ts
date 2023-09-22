import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
// @ts-ignore
import manifest from "./manifest";
import viteSvgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import wasmPack from 'vite-plugin-wasm-pack';
// import commonjs from '@rollup/plugin-commonjs';
import commonjs from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: "es2020",
    commonjsOptions: {
      // vite build use @rollup/plugin-commonjs as default, which transforms all the cjs files
      // However Sui Sdk mixed using esm & cjs，therefore should turn on transformMixedEsModules.
      // https://github.com/originjs/vite-plugins/issues/9#issuecomment-924668456
      transformMixedEsModules: true,
    },
    minify: mode === "production",
    rollupOptions: {
      // external: ["@aleohq/sdk"]
    }
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
    exclude: [
      // "@aleohq/sdk",
      // '@chakra-ui/react'
    ]
  },
  esbuild: {
    pure:
      mode === "production" ? ["console.log", "console.debug", "debugger"] : [],
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  define: {
  },
  plugins: [
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
    topLevelAwait(),
    react(),
    // commonjs(),
    // wasm(),
    wasmPack(["../../aleo/aleo_sdk/wasm"]),
    crx({ manifest }),
  ],
}));
