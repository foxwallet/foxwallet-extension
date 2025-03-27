const path = require("path");
const fs = require("fs");

function postInstall() {
  const aleoPath = path.resolve(__dirname, "../node_modules/@provablehq");
  if (fs.existsSync(aleoPath)) {
    fs.rmSync(aleoPath, { recursive: true, force: true });
  }
  const source = path.resolve(__dirname, "../@provablehq/mainnet/wasm");
  const target = path.resolve(__dirname, "../node_modules/@provablehq/wasm-mainnet");
  fs.cpSync(source, target, { recursive: true });
  console.log("Replaced @provablehq/wasm-mainnet successfully!");

  const sourceTestnet = path.resolve(__dirname, "../@provablehq/testnet/wasm");
  const targetTestnet = path.resolve(__dirname, "../node_modules/@provablehq/wasm-testnet");
  fs.cpSync(sourceTestnet, targetTestnet, { recursive: true });
  console.log("Replaced @provablehq/wasm-testnet successfully!");
}

postInstall();
