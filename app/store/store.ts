import { setStateReader } from "./currentState";
import { rootReducer } from "./index";
import { createProxyStore } from "./proxy";

const proxy = createProxyStore(
  chrome.runtime,
  rootReducer(undefined, { type: "@@init" }),
);
export const store = proxy.store;
setStateReader(store.getState);
export const storeReady = proxy.ready;
export type Store = typeof store;
export type { Dispatch, RootState } from "./types";
