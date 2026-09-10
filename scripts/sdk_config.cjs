const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const packages = [
  "@provablehq/sdk",
  "@provablehq/wasm",
  "provable-wasm-no-tla",
];
const { dependencies } = require("../package.json");
const version = dependencies[packages[0]];
if (
  !/^\d+\.\d+\.\d+$/.test(version) ||
  dependencies[packages[1]] !== version ||
  dependencies[packages[2]] !== `npm:@provablehq/wasm@${version}`
) {
  throw new Error(
    "Pin SDK and WASM to the same version; use npm:@provablehq/wasm@<version> for the no-TLA alias.",
  );
}

function checkInstalledVersions() {
  for (const name of packages) {
    const installed = JSON.parse(
      fs.readFileSync(
        path.join(root, "node_modules", name, "package.json"),
        "utf8",
      ),
    );
    if (installed.version !== version) {
      throw new Error(
        `${name}: expected ${version}, installed ${installed.version}. Run yarn install --ignore-scripts first.`,
      );
    }
  }
}

module.exports = { root, version, checkInstalledVersions };
