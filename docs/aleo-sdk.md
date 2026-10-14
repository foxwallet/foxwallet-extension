# Aleo SDK integration

`@provablehq/sdk` and `@provablehq/wasm` are pinned to `0.12.0`. The manually initialized copy uses exactly `"provable-wasm-no-tla": "npm:@provablehq/wasm@0.12.0"`. A Yarn resolution also pins the SDK's transitive WASM dependency.

Popup and background code import `provable-wasm-no-tla/mainnet.js` and await `initAleoWasm()` before using bindings. Concurrent initialization shares one promise; failed initialization can be retried. SDK imports remain in offscreen workers, where top-level await and the thread pool are supported. ESLint restricts imports to preserve that separation.

`yarn install` applies committed patches, copies both networks' WASM and thread workers to `public/`, and prepares WXT. The generated resources are ignored by Git and copied to the extension root in development and production. Their names contain the network and package version. Patched URLs start at `/`, so entrypoints and bundled workers can live in different directories without breaking asset loading. Official WASM binaries and type export paths remain unchanged.

To upgrade:

1. Change SDK, WASM, the npm alias and the Yarn resolution together to the same exact version.
2. Run `yarn install --ignore-scripts` to install that version before its new patches exist.
3. Run `yarn sdk:patch`. This generates both patches from a pristine npm archive in a temporary directory, updates the installed glue, and copies static resources. It fails if upstream initialization no longer matches the expected structure.
4. Run `yarn install --frozen-lockfile`, `yarn test:aleo`, `yarn build:dev`, and `yarn build:prod`.

The patch generator can be rerun without compounding edits. Only generated SDK patches are replaced; it does not remove dependency trees or run an install recursively.

`test:aleo` compiles the actual bindings with WXT's `import.meta.url` behavior, loads real WASM through a filesystem-backed extension URL adapter, compares keys against a synthetic fixture from the previous bindings, verifies signatures, checks failed-load retries and concurrent initialization, and starts the packaged SDK pool workers using Node worker threads. It does not access browser profiles, real wallet data, or send transactions.
