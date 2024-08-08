import localForage from "localforage";
import { type Cache } from "swr";
import { logger } from "./logger";
import { CoinType } from "core/types";
import { measureMemory } from "vm";

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
    swrStorageInstance.setItem(key, value).catch((err) => {
      logger.error("swrCache set error ", err.message);
    });
  },
  delete: (key) => {
    delete memoryCache[key];
    swrStorageInstance.removeItem(key).catch((err) => {
      logger.error("swrCache delete error ", err.message);
    });
  },
});
