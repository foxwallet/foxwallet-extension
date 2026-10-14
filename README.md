# FoxWallet Browser Extension

FoxWallet is a secure and user-friendly decentralized self-custody wallet designed to be the core gateway and connector in the Web3 world.

## Features

- **Account Management**: Supports multiple accounts, with mnemonic phrases and private keys stored only on the user's local device for security.
- **Multi-Chain Support**: Supports EVMs and Aleo.
- **Privacy Protection**: Enables Aleo asset transfers between public and private chains, supporting both public and private transactions.
- **DApp Support**: Built-in DApp browser for seamless interaction with decentralized applications.

## Project structure

- **app**: Contains all application UI pages, data management, routing, i18n (multi-language support), and other related functionalities.
- **core**: Wallet service functionalities, including mnemonic phrase handling, private key import, address derivation, transaction sending, etc.
- **env**: Directory for RPC and public API configuration files.
- **entrypoints**: WXT entrypoints for the wallet page, background service, content scripts, and offscreen document.
- **offscreen_service**: Offscreen workers for Aleo transactions and scanner registration encryption.
- **scripts**: Dependency patching, static WASM resource copying, and translation utilities.
- **patches**: Stores patch files for dependencies.
- **docs**: Architecture migration and Aleo SDK integration notes.

## Installation

FoxWallet browser extension currently supports Google Chrome. Ensure your Chrome version is 120 or later for the best experience.

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/foxwallet/pmmnimefaichbcnbndcfpaagbepnjaig).
2. Click the "Add to Chrome" button to install.

## Build

Use Node.js 22.12.0 or later and Yarn 1.22.22. Copy `.env.example` to `.env` and fill in the configuration, then install dependencies:

```shell
yarn install --frozen-lockfile
```

Installation applies the committed SDK patches, copies WASM and thread-worker resources from npm packages into `public/`, and prepares WXT.

Start development:

```shell
yarn dev
```

`web-ext.config.ts` launches Google Chrome for Testing with a dedicated profile under `.wxt/`. Set its binary path to match your installation. The development extension is written to `dist/chrome-mv3-dev/`.

Build a release or development package:

```shell
yarn build:prod # dist/chrome-mv3/
yarn build:dev  # dist/chrome-mv3-dev/
yarn zip       # release archive under dist/
```

## GitHub Actions

`.github/workflows/build.yml` builds and uploads a Chrome extension ZIP on pushes to `main`, `release/**`, tags matching `v*`, or a manual run. It downloads `.env` from the private `foxwallet/foxwallet-extension-env` repository's latest successful `generate-env.yml` run before installing dependencies and running `yarn zip`.

Configure the following under **Settings → Secrets and variables → Actions**:

| Type                | Name             | Value                                                                                                                                |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Secret              | `ENV_REPO_TOKEN` | Fine-grained PAT with **Actions: Read-only** access to the private environment repository; obtain organization approval if required. |
| Variable (optional) | `ENV_REPO`       | `owner/repository`; defaults to `foxwallet/foxwallet-extension-env`.                                                                 |
| Variable (optional) | `ENV_REF`        | Environment branch; defaults to `main`.                                                                                              |

First push the environment project to a **private** repository and run its `Generate environment` workflow to create the `dotenv` artifact. Manual extension builds can override `env_ref` and select an exact successful `env_run_id`. Artifacts expire after 30 days; rerun the environment workflow if needed. Environment changes do not automatically trigger extension builds. Pull requests do not run this workflow.

## Locale

```
yarn translate -p [your port]
```

## Features of Aleo

| Feature                    | Status             |
| -------------------------- | ------------------ |
| Account management         | :white_check_mark: |
| Local sync                 | :white_check_mark: |
| Public transfer            | :white_check_mark: |
| Private transfer           | :white_check_mark: |
| Public to private transfer | :white_check_mark: |
| Private to public transfer | :white_check_mark: |
| Join records               | :white_check_mark: |
| Split records              | :white_check_mark: |
| Dapp provider              | :white_check_mark: |
| Fungible token             | Working            |
| Non fungible token         | Working            |

## Aleo SDK

Aleo functionality uses the npm packages `@provablehq/sdk` and `@provablehq/wasm`, pinned to `0.11.3`. Popup and background code use `"provable-wasm-no-tla": "npm:@provablehq/wasm@0.11.3"` with explicit initialization; offscreen workers use the SDK for transactions, scanner encryption, and thread pools.

Run `yarn sdk:patch` when regenerating dependency patches. See [Aleo SDK integration](docs/aleo-sdk.md) for the upgrade procedure and verification commands.

## License

This project is licensed under the [MIT License](./LICENSE).
