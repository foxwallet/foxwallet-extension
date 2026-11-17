# Aleo SDK integration

`@provablehq/sdk` and `@provablehq/wasm` are pinned to `0.12.0`. The manually initialized copy uses exactly `"provable-wasm-no-tla": "npm:@provablehq/wasm@0.12.0"`. A Yarn resolution also pins the SDK's transitive WASM dependency.

Popup and background code import `provable-wasm-no-tla/mainnet.js` and await `initAleoWasm()` before using bindings. Concurrent initialization shares one promise; failed initialization can be retried. SDK imports remain in offscreen workers, where top-level await and the thread pool are supported. ESLint restricts imports to preserve that separation.

`yarn install` applies committed patches, copies both networks' WASM and thread workers to `public/`, and prepares WXT. The generated resources are ignored by Git and copied to the extension root in development and production. Their names contain the network and package version. Patched URLs start at `/`, so entrypoints and bundled workers can live in different directories without breaking asset loading. Official WASM binaries and type export paths remain unchanged.

In development, the offscreen transaction worker starts through an extension-origin Blob that imports its Vite module. The SDK thread pool resolves its packaged workers against the running worker's location (unwrapping the Blob URL), rather than the HTTP module URL. Both worker levels must remain in the extension origin: Chrome 148+ can terminate the extension renderer for a cross-origin worker entry script (`DWH_INVALID_SCRIPT_URL_ORIGIN`). WXT's upstream fix is tracked in [#2617](https://github.com/wxt-dev/wxt/pull/2617) and is not included in WXT 0.21.5.

Proof files use automatic 64 MiB chunks in the `keyChunks` IndexedDB table (database version 10). Program keypairs and the inclusion cache store small manifests with the chunk ID, byte length and count. Both database definitions and program-key consumers share this format. Reads reassemble bytes, treat missing or truncated chunks as cache misses, and still accept legacy arrays and Blobs. Each chunk owns a separate buffer: a typed-array view into the full file would serialize the full backing buffer and still exceed Chrome's limit.

This avoids Chrome's serialized-value limit (133,169,152 bytes in Chrome 156) for both the inclusion key (233,828,980 bytes) and accumulated function keys in a single program row. Caching Join followed by Split previously attempted a 155,202,701-byte program row and failed before transaction construction. Manifest replacement, chunk writes and old-chunk cleanup share one transaction; failed writes preserve the previous cache. Reset clears chunks with their owning rows. Cache write failures do not discard downloaded or synthesized keys that can still build the current transaction.

`node --test tests/aleo-key-cache.test.mjs` checks chunk boundaries, old formats, concurrent function writes, integrity checks, replacement cleanup, failure rollback, reset and cache-failure execution fallback. Chrome 156 validation also covers full-size inclusion keys and two 80 MiB function keys, which exceed the browser limit for inline values; the in-memory IndexedDB test implementation does not enforce that limit.

Transaction construction uses the SDK `KeyStore` interface backed by `sdkKeys` and the shared 64 MiB chunks. The SDK loads and persists both the executed function and functions called through imports; the previous separate top-level synthesis pass is no longer needed. Key identities include SDK version, network, program, function, edition, amendment and key type. Unversioned legacy program keys remain readable by legacy storage consumers, but transaction construction does not reuse them.

Each build resolves program metadata once and fetches sources at that exact edition, including imports. A later build refreshes this metadata so upgraded programs cannot reuse the previous edition's keys. Missing metadata fails source resolution instead of pairing an unversioned source with a default key version. Downloaded proving keys (including `fee_public` and `fee_private`) are cached by SDK version and the official URL. Cache persistence failures leave usable downloaded or synthesized keys available to the current build.

Execution and deployment share inclusion preloading, and the URL comes from the SDK's current inclusion metadata. Inclusion and SDK/download caches verify SHA-256 on reads. Corrupt or incomplete entries are evicted together with their chunks; inclusion entries without a digest are refetched once. SDK key-pair replacement remains atomic, and reset also clears `sdkKeys`.

`tests/aleo-prover-store.test.mjs` covers version isolation, corruption eviction, pair rollback, cache reuse across provider instances, URL rotation, optional persistence and source-version pinning. Transaction tests cover inclusion preloading and SDK cache configuration for execution and deployment.

To upgrade:

1. Change SDK, WASM, the npm alias and the Yarn resolution together to the same exact version.
2. Run `yarn install --ignore-scripts` to install that version before its new patches exist.
3. Run `yarn sdk:patch`. This generates both patches from a pristine npm archive in a temporary directory, updates the installed glue, and copies static resources. It fails if upstream initialization no longer matches the expected structure.
4. Run `yarn install --frozen-lockfile`, `yarn test:aleo`, `yarn build:dev`, and `yarn build:prod`.

The patch generator can be rerun without compounding edits. Only generated SDK patches are replaced; it does not remove dependency trees or run an install recursively.

`test:aleo` compiles the actual bindings with WXT's `import.meta.url` behavior, loads real WASM through a filesystem-backed extension URL adapter, compares keys against a synthetic fixture from the previous bindings, verifies signatures, checks failed-load retries and concurrent initialization, and starts the packaged SDK pool workers using Node worker threads. It does not access browser profiles, real wallet data, or send transactions.
