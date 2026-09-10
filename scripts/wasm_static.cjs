const fs = require("node:fs");
const path = require("node:path");
const { root, version, checkInstalledVersions } = require("./sdk_config.cjs");

checkInstalledVersions();
const publicDir = path.join(root, "public");
const assets = [];
for (const network of ["mainnet", "testnet"]) {
  const wasmName = `aleo_wasm_${network}_${version}.wasm`;
  const workerName = `worker_${network}_${version}.js`;
  for (const name of ["@provablehq/wasm", "provable-wasm-no-tla"]) {
    const index = fs.readFileSync(
      path.join(root, "node_modules", name, "dist", network, "index.js"),
      "utf8",
    );
    if (
      !index.includes(`"/${wasmName}"`) ||
      !index.includes(`"/${workerName}"`) ||
      (name === "provable-wasm-no-tla" &&
        !index.includes("export default initWasm;"))
    ) {
      throw new Error(`${name}/${network} is not patched. Run yarn sdk:patch.`);
    }
  }
  const dist = path.join(root, "node_modules/@provablehq/wasm/dist", network);
  assets.push([path.join(dist, "aleo_wasm.wasm"), wasmName]);
  assets.push([path.join(dist, "worker.js"), workerName]);
}
// Validate all sources before changing generated public assets.
for (const [source] of assets) fs.accessSync(source);
fs.mkdirSync(publicDir, { recursive: true });
const expected = new Set(assets.map(([, name]) => name));
for (const file of fs.readdirSync(publicDir)) {
  if (
    /^(?:aleo_wasm_(?:mainnet|testnet)_[\d.]+\.wasm|worker_(?:mainnet|testnet)_[\d.]+\.js)$/.test(
      file,
    ) &&
    !expected.has(file)
  ) {
    fs.unlinkSync(path.join(publicDir, file));
  }
}
for (const [source, name] of assets) {
  fs.copyFileSync(source, path.join(publicDir, name));
  console.log(`Copied public/${name}`);
}
