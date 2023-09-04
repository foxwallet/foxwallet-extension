import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
// @ts-ignore
import manifest from "./manifest";
import viteSvgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
  },
  esbuild: {
    pure:
      mode === "production" ? ["console.log", "console.debug", "debugger"] : [],
  },
  define: {},
  plugins: [
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
    crx({ manifest }),
    viteSvgr(),
  ],
}));
