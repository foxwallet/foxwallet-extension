import { defineManifest } from "@crxjs/vite-plugin";
import { version } from "./package.json";

export default defineManifest((env) => ({
  manifest_version: 3,
  name: "FoxWallet",
  description: "",
  version,
  version_name: version,
  icons: {
    "128": "logo.png",
  },
  action: { default_popup: "index.html" },
  permissions: ["storage"],
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
}));
