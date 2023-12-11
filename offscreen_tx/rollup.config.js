import { nodeResolve } from "@rollup/plugin-node-resolve";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import typescript from "@rollup/plugin-typescript";
import commonJs from "@rollup/plugin-commonjs";

export default {
  input: {
    offscreen: "./src/offscreen.ts",
    worker: "./src/worker.ts",
  },
  output: {
    dir: "../dist/offscreen_tx",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonJs(),
    typescript(),
    importMetaAssets({
      exclude: "./src/offscreen.ts",
    }),
  ],
};
