import localForage from "localforage";

export enum StorageKey {
  LOCAL_TX = "local_tx",
}

export const aleoAccountStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "fox_wallet",
});

export const aleoBlockStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
});
