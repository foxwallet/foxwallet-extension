const path = require("path");
const fs = require("fs");

// function postInstall() {
//   const aleoPath = path.resolve(__dirname, "../node_modules/@aleohq");
//   if (!fs.existsSync(aleoPath)) {
//     fs.rmdirSync(aleoPath);
//   }
//   const source = path.resolve(__dirname, "../@aleohq/wasm");
//   const target = path.resolve(__dirname, "../node_modules/@aleohq/wasm");
//   fs.cpSync(source, target, { recursive: true });
//   console.log("Replaced @aleohq/wasm successfully!");
// }

function postInstall() {
  const aleoPath = path.resolve(__dirname, "../node_modules/@provablehq");
  if (!fs.existsSync(aleoPath)) {
    fs.rmdirSync(aleoPath);
  }
  const source = path.resolve(__dirname, "../@provablehq/wasm");
  const target = path.resolve(__dirname, "../node_modules/@provablehq/wasm");
  fs.cpSync(source, target, { recursive: true });
  console.log("Replaced @provablehq/wasm successfully!");
}

postInstall();
