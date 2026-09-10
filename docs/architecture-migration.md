# WXT and Redux Toolkit migration

## Plan

1. Replace separate extension builds with WXT entrypoints, preserving popup markup, styles, dimensions and routes.
2. Replace the ten state models with Redux Toolkit slices and typed thunks.
3. Keep a single persisted store in the background and synchronize extension pages through a restricted port. Preserve bigint balances across the transport.
4. Keep IndexedDB fox_wallet/app, persist:root, encrypted vaults and existing database migrations. Add an idempotent schema migration and regression fixtures.
5. Remove obsolete build infrastructure, run state/messaging/RPC checks and production builds, and inspect packaged resources.

## Data compatibility

An upgrade must use the same extension ID/profile to retain Chrome storage and IndexedDB. No encrypted keyring format or derivation path changes are part of this migration. Existing persistence uses structured objects, not JSON strings. Older versions continue through the existing ordered migration chain.
