import path from "path";
import fs from "fs";

// const jsPath = path.resolve("./@aleohq/aleo_wasm/pkg/aleo_wasm.js");
const jsPath = path.resolve("./@provablehq/wasm/mainnet/src/aleo_wasm.js")
const code = fs.readFileSync(jsPath, { encoding: "utf-8" });
const regex = /input = new URL\('\/([^']+)'\, self\.location\);/g;

const replacedString = code.replace(
  regex,
  "input = new URL('$1', import.meta.url);",
);

fs.writeFileSync(jsPath, replacedString);
