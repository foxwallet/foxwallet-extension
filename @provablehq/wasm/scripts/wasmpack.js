import path from "path";
import fs from "fs";
import { execSync } from "child_process";

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function execWasmPack() {
  const target = process.argv[2];
  if (!target) {
    throw new Error(
      "The build target must be specified (e.g., 'mainnet' or 'testnet')",
    );
  }

  const newName = `aleo-wasm-${target}`;

  const tomlPath = path.resolve("../wasm/Cargo.toml");
  const code = fs.readFileSync(tomlPath, { encoding: "utf-8" });

  const regex = /name\s*=\s*".*"/;
  const replacedString = code.replace(regex, `name = "${newName}"`);
  fs.writeFileSync(tomlPath, replacedString);
  console.log(`Updated Cargo.toml with package name: ${newName}`);

  console.log(`Start building ${target}...`);

  console.time(`Built ${target} finished!`);
  execSync(
    `RUSTFLAGS='' wasm-pack build --release --target web --features 'browser,${target}'`,
    { stdio: "inherit" },
  );
  console.timeEnd(`Built ${target} finished!`);

  // reset package name
  fs.writeFileSync(tomlPath, code.replace(regex, `name = "aleo-wasm"`));

  const sourceDir = path.resolve("../wasm/pkg");
  const targetDir = path.resolve(`../${target}/aleo_wasm_${target}/pkg`);

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });

  copyRecursiveSync(sourceDir, targetDir);
  console.log(`Copied pkg to ${targetDir}`);

  const snippetsDir = path.resolve(targetDir, "snippets");
  if (fs.existsSync(snippetsDir)) {
    fs.rmSync(snippetsDir, { recursive: true, force: true });
  }
  const ignoreFile = path.resolve(targetDir, ".gitignore");
  if (fs.existsSync(ignoreFile)) {
    fs.rmSync(ignoreFile, { recursive: true, force: true });
  }

  // 将 spawnWorker 函数插入到 aleo_wasm_${network}.js 文件的最前面
  const aleoWasmFile = path.join(targetDir, `aleo_wasm_${target}.js`);
  const spawnWorkerFunction = `
function spawnWorker(url, module, memory, address) {
  return new Promise((resolve) => {
    const worker = new Worker(url, {
      type: "module",
    });

    worker.addEventListener("message", (event) => {
      setTimeout(() => {
        resolve(worker);
        if (worker.unref) {
          worker.unref();
        }
      }, 0);
    }, {
      capture: true,
      once: true,
    });

    worker.postMessage({
      module,
      memory,
      address,
    });
  });
}
`;

  let aleoWasmContent = fs.readFileSync(aleoWasmFile, { encoding: "utf-8" });
  aleoWasmContent = aleoWasmContent.split('\n').slice(1).join('\n');
  fs.writeFileSync(aleoWasmFile, spawnWorkerFunction + aleoWasmContent);
}

execWasmPack();
