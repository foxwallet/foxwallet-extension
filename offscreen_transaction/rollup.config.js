import { nodeResolve } from "@rollup/plugin-node-resolve";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import typescript from "@rollup/plugin-typescript";
import commonJs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const production = process.env.NODE_ENV === "production";

export default {
  input: {
    index: "./src/index.ts",
    worker: "./src/worker.ts",
  },
  output: {
    dir: "../dist/offscreen_transaction",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonJs(),
    typescript(),
    importMetaAssets({
      exclude: "./src/index.ts",
    }),
    production &&
      terser({
        compress: {
          drop_console: true,
        },
      }),
  ],
};
