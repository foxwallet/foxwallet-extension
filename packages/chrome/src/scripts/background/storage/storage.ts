import localForage from "localforage";
import { Cache } from "swr";
import { logger } from "../../../common/utils/logger";

export const bgStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
  storeName: "core",
});

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
    let keys = Object.keys(memoryCache);
    for (let key of keys) {
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
