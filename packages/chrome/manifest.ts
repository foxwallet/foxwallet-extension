import { defineManifest } from "@crxjs/vite-plugin";
import { version } from "./package.json";

export default defineManifest((env) => {
  return {
    manifest_version: 3,
    name: "FoxWallet",
    description: "",
    version,
    version_name: version,
    icons: {
      "128": "logo.png",
    },
    action: { default_popup: "index.html" },
    permissions: [ "storage", "clipboardWrite", "unlimitedStorage", "activeTab", "tabs" ],
    content_scripts: [
      {
        matches: ["http://*/*", "https://*/*"],
        js: ["src/scripts/content/index.ts"],
        run_at: "document_start",
      },
    ],
    background: {
      service_worker: "src/scripts/background/index.ts",
    },
    content_security_policy: {
      "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
    },
    web_accessible_resources: [{
      "matches": [ "http://localhost/*", "http://127.0.0.1/*", "https://*/*" ],
      "resources": [ ]
    }],
  }
});
