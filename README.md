# FoxWallet Browser Extension

FoxWallet supports Google chrome for now. Please make sure your [chrome's version](chrome://settings/help) is beyond 120. We recommend using the latest available browser version.

## Build

1. Rename .env.example to .env and Fill out the configs in .env.
2. Run the following commands.

- Environment: Require Node version 18

```shell
yarn wasm
yarn
yarn build:dev
```

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
