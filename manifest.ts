import { defineManifest } from "@crxjs/vite-plugin";
import { version } from "./package.json";

export default defineManifest((env) => {
  return {
    manifest_version: 3,
    name: "FoxWallet | Aleo Wallet",
    description: "Browser Wallet for Aleo powered by FoxWallet",
    version,
    icons: {
      "128": "logo.png",
    },
    action: { default_popup: "index.html" },
    permissions: [
      "storage",
      "clipboardWrite",
      "unlimitedStorage",
      "tabs",
      "offscreen",
    ],
    content_scripts: [
      {
        matches: ["http://*/*", "https://*/*"],
        js: ["app/scripts/content/index.ts"],
        run_at: "document_start",
      },
    ],
    background: {
      service_worker: "app/scripts/background/index.ts",
    },
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
    },
    web_accessible_resources: [
      {
        matches: ["http://localhost/*", "http://127.0.0.1/*", "https://*/*"],
        resources: ["injector.js"],
      },
    ],
    minimum_chrome_version: "120",
  };
});
