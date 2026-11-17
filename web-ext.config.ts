import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    chrome: path.join(
      homedir(),
      "chrome/mac_arm-156.0.8078.80/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    ),
  },
  chromiumArgs: [
    "--test-type=gpu",
    `--user-data-dir=${fileURLToPath(
      new URL("./.wxt/chrome-data-156", import.meta.url),
    )}`,
  ],
});
