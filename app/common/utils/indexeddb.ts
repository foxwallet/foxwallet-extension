import localForage from "localforage";
import { type Cache } from "swr";
import { logger } from "./logger";
import { type CoinType } from "core/types";

// both background service and popup run in the same extension context, so the indexedDB is the same
export const appStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "app",
});

export const aleoAccountStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "aleo",
});

// To remember the selected account
/**
 * @deprecated
 */
export const createAccountSettingStorage = (coinType: CoinType) => {
  return localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: "fox_wallet",
    storeName: `${coinType}_account_setting`,
  });
};

export const swrStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "swr_cache",
  storeName: "cache",
});

let memoryCache: { [key in string]?: any } = {};
let storeCache: { [key in string]?: any } = {};

// SWR can place transient values (for example promises, updater functions,
// Axios errors, or class instances) in a cache provider. IndexedDB uses the
// structured clone algorithm and rejects those values. Keep them in memory so
// SWR continues to work, but only persist plain data values.
const isPersistable = (
  value: unknown,
  seen = new WeakSet<object>(),
): boolean => {
  if (value === null || value === undefined) return true;
  const valueType = typeof value;
  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean" ||
    valueType === "bigint"
  ) {
    return true;
  }
  if (valueType !== "object") return false;

  const objectValue = value as object;
  if (seen.has(objectValue)) return true;
  seen.add(objectValue);
  if (Array.isArray(value)) {
    return value.every((item) => isPersistable(item, seen));
  }
  const prototype = Object.getPrototypeOf(objectValue);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.values(value as Record<string, unknown>).every((item) =>
    isPersistable(item, seen),
  );
};

swrStorageInstance
  .iterate((value, key) => {
    storeCache[key] = value;
  })
  .catch((err) => {
    logger.log("swrStorageInstance iterate error ", err.message);
  })
  .finally(() => {
    memoryCache = {
      ...storeCache,
      ...memoryCache,
    };
  });

export const clearSwrCache = async () => {
  await swrStorageInstance.clear();
  memoryCache = {};
  storeCache = {};
};

export const swrCache = (): Cache => ({
  keys: function* () {
    const keys = Object.keys(memoryCache);
    for (const key of keys) {
      yield key;
    }
  },
  get: (key) => {
    return memoryCache[key];
  },
  set: (key, value) => {
    memoryCache[key] = value;
    if (!isPersistable(value)) {
      return;
    }
    // Cache persistence is best effort. A failed write must not surface as a
    // console/revalidation loop or affect the in-memory SWR cache.
    void swrStorageInstance.setItem(key, value).catch(() => undefined);
  },
  delete: (key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete memoryCache[key];
    void swrStorageInstance.removeItem(key).catch(() => undefined);
  },
});
