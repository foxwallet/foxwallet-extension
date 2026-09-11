import type { UserManifest } from "wxt";
import { version } from "./package.json";

const manifest: UserManifest = {
  name: "FoxWallet",
  description: "Your Go-to Web3 Wallet.",
  version,
  icons: {
    "128": "logo.png",
  },
  action: { default_title: "FoxWallet" },
  permissions: [
    "storage",
    "clipboardWrite",
    "unlimitedStorage",
    "tabs",
    "offscreen",
    "sidePanel",
  ],
  host_permissions: [
    "https://api.provable.com/*",
    "https://aleo1-web3.foxnb.net/*",
    "https://aleo2-web3.foxnb.net/*",
    "https://aleo3-web3.foxnb.net/*",
    "https://aleo4-web3.foxnb.net/*",
    "https://aleo5-web3.foxnb.net/*",
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
  },
  web_accessible_resources: [
    {
      matches: ["http://localhost/*", "http://127.0.0.1/*", "https://*/*"],
      resources: ["injector.js"],
    },
  ],
  minimum_chrome_version: "120",
};

export default manifest;
