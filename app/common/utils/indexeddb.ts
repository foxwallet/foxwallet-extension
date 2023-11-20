import localForage from "localforage";
import { type Cache } from "swr";
import { logger } from "./logger";

// both background service and popup run in the same extension context, so the indexedDB is the same
export const appStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "app",
});

export const aleoAccountStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
});

export const aleoBlockStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
});

const aleoBlockStorageMap = new Map<string, LocalForage>();

export enum StorageKey {
  BLOCK = "block",
  INFO = "info",
}

export const getAleoStorageInstance = (
  chainId: string,
  address: string,
  prefix: StorageKey,
) => {
  const key = `${chainId}-${prefix}-${address}`;
  const existInstance = aleoBlockStorageMap.get(key);
  if (existInstance) {
    return existInstance;
  }
  const newInstance = aleoBlockStorageInstance.createInstance({
    name: chainId,
    storeName: `${prefix}-${address}`,
  });
  aleoBlockStorageMap.set(key, newInstance);
  return newInstance;
};

const swrStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "swr_cache",
  storeName: "cache",
});

const memoryCache = new Map();

swrStorageInstance
  .iterate((value, key) => {
    memoryCache.set(key, value);
  })
  .catch((err) => {
    logger.log("swrStorageInstance iterate error ", err.message);
  });

export const swrCache: Cache = {
  keys: function* () {
    const keys = Object.keys(memoryCache);
    for (const key of keys) {
      yield key;
    }
  },
  get: (key) => {
    return memoryCache.get(key);
  },
  set: (key, value) => {
    memoryCache.set(key, value);
    localForage.setItem(key, value).catch((err) => {
      logger.error("swrCache set error ", err.message);
    });
  },
  delete: (key) => {
    memoryCache.delete(key);
    localForage.removeItem(key).catch((err) => {
      logger.error("swrCache delete error ", err.message);
    });
  },
};
