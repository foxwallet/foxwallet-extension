import localForage from "localforage";
import { type Cache } from "swr";
import { logger } from "./logger";
import browser from "webextension-polyfill";

// both background service and popup run in the same extension context, so the indexedDB is the same
export const appStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "app",
});

// export const walletStorageInstance = localForage.createInstance({
//   driver: localForage.INDEXEDDB,
//   name: "fox_wallet",
//   storeName: "core",
// });

export const walletStorageInstance = browser.storage.local;

const swrStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "swr_cache",
  storeName: "cache",
});

const memoryCache = new Map();

swrStorageInstance.iterate((value, key) => {
  memoryCache.set(key, value);
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
