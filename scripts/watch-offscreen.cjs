const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "dist", "offscreen");
const target = path.join(root, "offscreen");

let syncTimer = null;
let outputBuffer = "";

function syncOffscreen() {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.rmSync(target, { force: true, recursive: true });
  fs.cpSync(source, target, { recursive: true });
  console.log("[offscreen] synced dist/offscreen to offscreen");
}

function scheduleSync() {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
  syncTimer = setTimeout(() => {
    syncTimer = null;
    syncOffscreen();
  }, 100);
}

function handleOutput(chunk, stream) {
  const output = chunk.toString();
  stream.write(output);
  outputBuffer = `${outputBuffer}${output}`.slice(-1000);
  if (outputBuffer.includes("created ../dist/offscreen")) {
    outputBuffer = "";
    scheduleSync();
  }
}

const watcher = spawn("npx", ["rollup", "-c", "-w"], {
  cwd: path.join(root, "offscreen_service"),
  env: {
    ...process.env,
    NODE_ENV: "development",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

watcher.stdout.on("data", (chunk) => {
  handleOutput(chunk, process.stdout);
});

watcher.stderr.on("data", (chunk) => {
  handleOutput(chunk, process.stderr);
});

watcher.on("exit", (code, signal) => {
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 1);
});

process.on("SIGINT", () => {
  watcher.kill("SIGINT");
});

process.on("SIGTERM", () => {
  watcher.kill("SIGTERM");
});
