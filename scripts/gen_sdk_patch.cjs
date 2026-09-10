const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { root, version, checkInstalledVersions } = require("./sdk_config.cjs");

// Generate from a pristine registry package, so rerunning never compounds patches.
// Only JS glue changes: official binaries, exports and key algorithms stay intact.
checkInstalledVersions();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "foxwallet-sdk-patch-"));
const patches = [];

function replaceRequired(source, before, after) {
  if (!source.includes(before))
    throw new Error(`Upstream layout changed: missing ${before}`);
  return source.replaceAll(before, after);
}

try {
  const packed = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        `@provablehq/wasm@${version}`,
        "--ignore-scripts",
        "--json",
        "--pack-destination",
        temp,
      ],
      { cwd: temp, encoding: "utf8" },
    ),
  );
  execFileSync("tar", [
    "-xzf",
    path.join(temp, packed[0].filename),
    "-C",
    temp,
  ]);

  for (const name of ["@provablehq/wasm", "provable-wasm-no-tla"]) {
    const noTla = name === "provable-wasm-no-tla";
    const before = path.join("before", "node_modules", name);
    const after = path.join("after", "node_modules", name);
    for (const dir of [before, after]) {
      fs.mkdirSync(path.dirname(path.join(temp, dir)), { recursive: true });
      fs.cpSync(path.join(temp, "package"), path.join(temp, dir), {
        recursive: true,
      });
    }
    for (const network of ["mainnet", "testnet"]) {
      const dist = path.join(temp, after, "dist", network);
      const index = path.join(dist, "index.js");
      let source = fs.readFileSync(index, "utf8");
      // WXT bundles workers under /assets; all WASM and pool workers live at /.
      source = replaceRequired(
        source,
        'new URL("aleo_wasm.wasm", import.meta.url)',
        `new URL("/aleo_wasm_${network}_${version}.wasm", import.meta.url)`,
      );
      source = replaceRequired(
        source,
        'new URL("worker.js", import.meta.url)',
        `new URL("/worker_${network}_${version}.js", import.meta.url)`,
      );
      if (noTla) {
        const initialization =
          /const module\$1 = new URL\([^\n]+\);\s*await __wbg_init\(\{ module_or_path: module\$1 \}\);/;
        if (!initialization.test(source))
          throw new Error("Upstream WASM initialization changed");
        source = source.replace(
          initialization,
          (block) =>
            `async function initWasm() {\n  ${block.replace(
              /\s*await /,
              "\n  await ",
            )}\n}\n`,
        );
        source = replaceRequired(
          source,
          "export { Address,",
          "export default initWasm;\nexport { Address,",
        );
        const types = path.join(dist, "index.d.ts");
        fs.writeFileSync(
          types,
          replaceRequired(
            fs.readFileSync(types, "utf8"),
            'export * from "./aleo_wasm.js";',
            'export default function initWasm(): Promise<void>;\nexport * from "./aleo_wasm.js";',
          ),
        );
      }
      fs.writeFileSync(index, source);
      const worker = path.join(dist, "worker.js");
      fs.writeFileSync(
        worker,
        replaceRequired(
          fs.readFileSync(worker, "utf8"),
          'new URL("aleo_wasm.wasm", import.meta.url)',
          `new URL("/aleo_wasm_${network}_${version}.wasm", import.meta.url)`,
        ),
      );
    }
    const diff = spawnSync(
      "git",
      [
        "diff",
        "--no-index",
        "--no-ext-diff",
        "--src-prefix=a/",
        "--dst-prefix=b/",
        before,
        after,
      ],
      { cwd: temp, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
    );
    if (diff.status !== 1 || !diff.stdout)
      throw new Error(diff.stderr || "Expected a nonempty patch");
    patches.push({
      filename: `${name.replaceAll("/", "+")}+${version}.patch`,
      content: diff.stdout
        .replaceAll("a/before/node_modules/", "a/node_modules/")
        .replaceAll("b/after/node_modules/", "b/node_modules/"),
      name,
      source: path.join(temp, after),
    });
  }

  // Finish generating both patches before replacing the existing patch set.
  const patchDir = path.join(root, "patches");
  fs.mkdirSync(patchDir, { recursive: true });
  for (const file of fs.readdirSync(patchDir)) {
    if (/^(?:@provablehq\+wasm|provable-wasm-no-tla)\+.*\.patch$/.test(file)) {
      fs.unlinkSync(path.join(patchDir, file));
    }
  }
  for (const patch of patches) {
    fs.writeFileSync(path.join(patchDir, patch.filename), patch.content);
    // Update only the glue files changed by this generator, not the package tree.
    for (const network of ["mainnet", "testnet"]) {
      const files =
        patch.name === "provable-wasm-no-tla"
          ? ["index.js", "index.d.ts", "worker.js"]
          : ["index.js", "worker.js"];
      for (const file of files) {
        const relative = path.join("dist", network, file);
        fs.copyFileSync(
          path.join(patch.source, relative),
          path.join(root, "node_modules", patch.name, relative),
        );
      }
    }
    console.log(`Generated ${patch.filename}`);
  }
  require("./wasm_static.cjs");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
