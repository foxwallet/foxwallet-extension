# FoxWallet Browser Extension

FoxWallet is a secure and user-friendly decentralized self-custody wallet designed to be the core gateway and connector in the Web3 world.

## Features

- **Account Management**: Supports multiple accounts, with mnemonic phrases and private keys stored only on the user's local device for security.
- **Multi-Chain Support**: Supports EVMs and Aleo.
- **Privacy Protection**: Enables Aleo asset transfers between public and private chains, supporting both public and private transactions.
- **DApp Support**: Built-in DApp browser for seamless interaction with decentralized applications.

## Project structure
Below are descriptions of some key directories in the project:  

- **app**: Contains all application UI pages, data management, routing, i18n (multi-language support), and other related functionalities.  
- **core**: Wallet service functionalities, including mnemonic phrase handling, private key import, address derivation, transaction sending, etc.  
- **env**: Directory for RPC and public API configuration files.  
- **offscreen_sync**: Offscreen Document functionality added specifically for Aleo blockchain synchronization.  
- **offscreen_transaction**: Offscreen Document functionality added specifically for sending Aleo transactions.  
- **fox-aleo-sdk**: A customized package based on [@provablehq/sdk](https://github.com/ProvableHQ/sdk), which is compiled using `fox-aleo-sdk/wasm` to generate a WASM package suitable for JavaScript.  
- **@provablehq**: Packaged output based on `fox-aleo-sdk`, intended for use in different scenarios.  
- **script**: Contains scripts for specific functionalities.  
- **patches**: Stores patch files for dependencies.  

## Installation

FoxWallet browser extension currently supports Google Chrome. Ensure your Chrome version is 120 or later for the best experience.

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/foxwallet/pmmnimefaichbcnbndcfpaagbepnjaig).
2. Click the "Add to Chrome" button to install.

## Build

### Normal

1. Rename .env.example to .env and Fill out the configs in .env.
2. Run the following commands.

- Environment: Require Node version 18

```shell
yarn
yarn build:dev
```

### Modified Rust  

If you modify the Rust code in `fox-aleo-sdk/wasm`, you need to recompile the WASM package:  

```shell
cd fox-aleo-sdk/wasm && yarn install # Node >= 22.1.5 may be required, install and switch as needed
yarn build:all
cd ../.. && yarn build:dev
```

> If you ensure that your Node.js version is compatible, you can directly run `yarn wasm` in the root directory to compile the WASM package, and then run `yarn build:dev`.

## Features

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

## License

This project is licensed under the [MIT License](./LICENSE).

## About `@provablehq`  

Since this project started early, it was initially built based on `@aleohq/wasm` (which has now migrated to [@provablehq/sdk](https://github.com/ProvableHQ/sdk)). Additionally, we have added some custom Rust code to better align with the business needs of the extension. The current WebAssembly (WASM) compilation process involves the following two methods:  

- **`wasm-pack`**: Compiles the original WASM package. After compilation, the output is copied to `@provablehq/mainnet/aleo_wasm_mainnet` and `@provablehq/testnet/aleo_wasm_testnet`. In the application, it is imported using:  
  ```js
  import { PrivateKey } from 'aleo_wasm_mainnet';
  // or
  import { PrivateKey } from 'aleo_wasm_testnet';
  ```
  
- **Rollup**: Follows the packaging approach of `@provablehq/sdk`. The output is copied to `@provablehq/mainnet/wasm` and `@provablehq/testnet/wasm`. In the application, it is imported using:  
  ```js
  import { initThreadPool } from '@provablehq/wasm-mainnet';
  // or
  import { initThreadPool } from '@provablehq/wasm-testnet';
  ```
  You can find the corresponding dependencies for `@provablehq/wasm-mainnet` in the `package.json` file.  

The existence of these two packaging methods is related to the project's technical architecture and the characteristics of the compiled output. Chrome Extension Manifest V3 does not support the **Top-Level Await** feature, which is included in the official package. To resolve this issue, we leverage the **Offscreen Document** feature, which is why you can see `offscreen_sync` and `offscreen_transaction` in the project.  

> In summary, if you need to call the `initThreadPool` function, you must import `@provablehq/wasm-mainnet`. Since it involves the **Top-Level Await** feature, it must be placed inside an **Offscreen Document**. In all other cases, `aleo_wasm_mainnet` can be imported and used directly.