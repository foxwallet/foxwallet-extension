import { configureStore, type Middleware, type UnknownAction } from "@reduxjs/toolkit";
import { persistReducer, persistStore, createMigrate, PAUSE, REHYDRATE, type MigrationManifest } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { rootReducer, type RootState } from "./index";
import { migrations, version } from "./migrations";
import { serializableOptions } from "./middleware";

export function createPersistedStore(storage: {
  getItem(key: string): Promise<unknown>;
  setItem(key: string, value: unknown): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}) {
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  let restoreError: Error | undefined;
  let writeError: Error | undefined;
  const ready = new Promise<void>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  const migrate = createMigrate(migrations as unknown as MigrationManifest);
  const reducer = persistReducer<RootState>({
    key: "root",
    storage: {
      getItem: async (key: string) => {
        const value = await storage.getItem(key);
        if (value != null && (typeof value !== "object" || Array.isArray(value))) throw new Error("Invalid persisted wallet state");
        return value;
      },
      setItem: async (key: string, value: unknown) => {
        const result = await storage.setItem(key, value);
        writeError = undefined;
        return result;
      },
      removeItem: (key: string) => storage.removeItem(key),
    },
    version,
    timeout: 0,
    serialize: false,
    // Runtime supports direct IndexedDB objects; the published types omit this.
    ...{ deserialize: false },
    stateReconciler: autoMergeLevel2,
    migrate: async (state, targetVersion) => {
      if (state && state._persist?.version > targetVersion) throw new Error("Wallet state was saved by a newer version");
      return migrate(state, targetVersion);
    },
    writeFailHandler: (error: Error) => { writeError = error; },
  }, rootReducer);
  const restoreGuard: Middleware<{}, RootState> = api => next => action => {
    const event = action as UnknownAction;
    if (event.type === REHYDRATE && event.err) {
      restoreError = event.err instanceof Error ? event.err : new Error(String(event.err));
      // Pause before the failed rehydration can queue the default state to disk.
      api.dispatch({ type: PAUSE });
      rejectReady(restoreError);
    }
    return next(action);
  };
  const store = configureStore({
    reducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: serializableOptions }).prepend(restoreGuard),
    devTools: false,
  });
  const persistor = persistStore(store, undefined, () => { if (!restoreError) resolveReady(); });
  const flush = async () => {
    await ready;
    await persistor.flush();
    if (writeError) throw writeError;
  };
  return { store, persistor, ready, flush };
}
