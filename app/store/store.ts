import { configureStore } from "@reduxjs/toolkit";
import { setStateReader } from "./currentState";
import { rootReducer } from "./index";
import { createProxyStore } from "./proxy";

// Keep type generation and non-Chrome entrypoints usable without a runtime
// port. createProxyStore also handles WXT's fake browser when it is injected.
const proxy = import.meta.env.CHROME
  ? createProxyStore(chrome.runtime, rootReducer(undefined, { type: "@@init" }))
  : undefined;

export const store =
  proxy?.store ??
  configureStore({
    reducer: rootReducer,
    devTools: false,
  });
setStateReader(store.getState);
export const storeReady = proxy?.ready ?? Promise.resolve();
export type Store = typeof store;
export type { Dispatch, RootState } from "./types";
