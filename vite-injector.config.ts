import path from "path";
import { defineConfig } from "vite";
import packageInfo from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "app/scripts/content/injector.ts"),
      fileName: "injector",
      name: packageInfo.name,
      formats: ["es"],
    },
    outDir: "public",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "app") },
      { find: "core", replacement: path.resolve(__dirname, "core") },
      { find: "aleo", replacement: path.resolve(__dirname, "aleo") },
    ],
  },
  plugins: [],
});
