import path from "path";
import fs from "fs";

const jsPath = path.resolve("./@aleohq/aleo_wasm/pkg/aleo_wasm.js");
const code = fs.readFileSync(jsPath, { encoding: "utf-8" });
const regex = /input = new URL\('([^']+)'\, import\.meta\.url\);/g;

const replacedString = code.replace(
  regex,
  "input = new URL('/$1', self.location);",
);

fs.writeFileSync(jsPath, replacedString);
