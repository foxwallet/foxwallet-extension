import fs from "fs";
import path from "path";

const srcDir = path.resolve("../wasm/dist");
const mainnetDestDir = path.resolve("../mainnet/wasm");
const testnetDestDir = path.resolve("../testnet/wasm");

function getVersion() {
  const packageJsonPath = path.resolve("../wasm/package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJsonData = JSON.parse(packageJsonContent);
  return packageJsonData.version;
}

function copyFiles(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    fs.copyFileSync(srcFile, destFile);
  });

  const name = dest.includes("mainnet")
    ? "@provablehq/wasm-mainnet"
    : "@provablehq/wasm-testnet";

  const packageJson = {
    name,
    version: getVersion(),
    description: "SnarkVM WASM binaries with javascript bindings",
    collaborators: ["The Provable Team"],
    license: "GPL-3.0",
    type: "module",
    main: "./index.js",
    browser: "./index.js",
    types: "./index.d.ts",
    exports: {
      ".": "./index.js",
      "./worker.js": "./worker.js",
    },
    files: ["src", "LICENSE.md", "README.md"],
    repository: {
      type: "git",
      url: "git+https://github.com/ProvableHQ/sdk.git",
    },
    keywords: ["Aleo", "Blockchain", "Zero Knowledge", "ZK"],
    bugs: {
      url: "https://github.com/ProvableHQ/sdk/issues",
    },
    homepage: "https://github.com/ProvableHQ/sdk#readme",
  };

  fs.writeFileSync(
    path.join(dest, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );
}

copyFiles(path.join(srcDir, "mainnet"), mainnetDestDir);
copyFiles(path.join(srcDir, "testnet"), testnetDestDir);

console.log("Wasm files copied successfully.");
