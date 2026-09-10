import {
  configureStore,
  type Middleware,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { STORE_PORT, serializeState, deserializeState } from "./serialization";
import type { RootState } from "./index";
import { serializableOptions } from "./middleware";
import { reconcileState } from "./reconcileState";

export function createProxyStore(
  runtime: Pick<typeof chrome.runtime, "connect">,
  initialState: RootState,
) {
  let port: chrome.runtime.Port | undefined;
  let sequence = 0;
  let disposed = false;
  let lastSnapshot: string | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Map<
    number,
    {
      resolve(action: UnknownAction): void;
      reject(error: Error): void;
      action: UnknownAction;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const mirrorType = "@@foxwallet/state";
  const remote: Middleware<{}, RootState> = () => (next) => (action) => {
    const event = action as UnknownAction;
    if (event.type === mirrorType) return next(event);
    if (!port)
      return Promise.reject(new Error("Background state is reconnecting"));
    const activePort = port;
    return new Promise<UnknownAction>((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("State update timed out"));
      }, 30000);
      pending.set(id, { resolve, reject, action: event, timer });
      try {
        activePort.postMessage({ id, action: serializeState(event) });
      } catch (error) {
        clearTimeout(timer);
        pending.delete(id);
        reject(error);
      }
    });
  };
  const store = configureStore({
    reducer: (state = initialState, action: UnknownAction): RootState =>
      action.type === mirrorType
        ? reconcileState(state, action.payload as RootState)
        : state,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: serializableOptions }).concat(
        remote,
      ),
    devTools: false,
  });
  const rejectPending = () => {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(
        new Error(
          "Background connection closed; state update may already have been saved",
        ),
      );
    }
    pending.clear();
  };
  const connect = () => {
    if (disposed) return;
    const activePort = runtime.connect({ name: STORE_PORT });
    port = activePort;
    activePort.onMessage.addListener((message) => {
      if (disposed || port !== activePort) return;
      if (message.state) {
        // An acknowledgement carries the same snapshot as the preceding
        // broadcast. It must resolve dispatch without notifying React again.
        if (message.state !== lastSnapshot) {
          store.dispatch({
            type: mirrorType,
            payload: deserializeState<RootState>(message.state),
          });
          lastSnapshot = message.state;
        }
        resolveReady();
      }
      if (message.type === "fatal") rejectReady(new Error(message.error));
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.delete(message.id);
      if (message.type === "error") item.reject(new Error(message.error));
      else item.resolve(item.action);
    });
    activePort.onDisconnect.addListener(() => {
      if (port !== activePort) return;
      port = undefined;
      rejectPending();
      if (!disposed) reconnectTimer = setTimeout(connect, 250);
    });
  };
  connect();
  return {
    store,
    ready,
    dispose() {
      disposed = true;
      clearTimeout(reconnectTimer);
      rejectPending();
      port?.disconnect();
      port = undefined;
    },
  };
}
