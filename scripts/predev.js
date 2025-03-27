import path from "path";
import fs from "fs";

const jsPath = path.resolve(
  "./@provablehq/mainnet/aleo_wasm_mainnet/pkg/aleo_wasm_mainnet.js",
);
const code = fs.readFileSync(jsPath, { encoding: "utf-8" });
const regex = /input = new URL\('\/assets\/([^']+)'\, self\.location\);/g;

const replacedString = code.replace(
  regex,
  "input = new URL('$1', import.meta.url);",
);

fs.writeFileSync(jsPath, replacedString);
