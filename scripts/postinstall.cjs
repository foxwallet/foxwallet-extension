const path = require("path");
const fs = require("fs");

function postInstall() {
  const source = path.resolve(__dirname, "../@provablehq/mainnet/wasm");
  const target = path.resolve(__dirname, "../node_modules/@provablehq/wasm-mainnet");
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, { recursive: true });
  console.log("Replaced @provablehq/wasm-mainnet successfully!");

  const sourceTestnet = path.resolve(__dirname, "../@provablehq/testnet/wasm");
  const targetTestnet = path.resolve(__dirname, "../node_modules/@provablehq/wasm-testnet");
  if (fs.existsSync(targetTestnet)) {
    fs.rmSync(targetTestnet, { recursive: true, force: true });
  }
  fs.cpSync(sourceTestnet, targetTestnet, { recursive: true });
  console.log("Replaced @provablehq/wasm-testnet successfully!");
}

postInstall();
