import type { Store, UnknownAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { STORE_PORT, serializeState, deserializeState } from "./serialization";

export function connectStoreServer(
  runtime: Pick<typeof chrome.runtime, "id" | "getURL" | "onConnect">,
  store: Pick<Store<RootState>, "dispatch" | "getState" | "subscribe">,
  ready: Promise<void>,
  flush: () => Promise<unknown>,
  allowedActions: Set<string>,
) {
  const ports = new Set<chrome.runtime.Port>();
  const post = (port: chrome.runtime.Port, value: unknown) => {
    try {
      port.postMessage(value);
    } catch {
      ports.delete(port);
    }
  };
  let cachedState: RootState | undefined;
  let cachedSnapshot = "";
  const snapshot = () => {
    const state = store.getState();
    if (state !== cachedState) {
      cachedState = state;
      cachedSnapshot = serializeState(state);
    }
    return cachedSnapshot;
  };
  let lastBroadcast = snapshot();
  const unsubscribe = store.subscribe(() => {
    if (!ports.size) return;
    const state = snapshot();
    // Redux notifies subscribers for no-op and persistence flush actions too.
    if (state === lastBroadcast) return;
    lastBroadcast = state;
    for (const port of ports) post(port, { type: "state", state });
  });
  const onConnect = (port: chrome.runtime.Port) => {
    if (port.name !== STORE_PORT) return;
    // Content scripts share the extension ID. Check the document URL as well.
    const documentUrl = port.sender?.url?.split(/[?#]/)[0];
    if (
      port.sender?.id !== runtime.id ||
      documentUrl !== runtime.getURL("index.html")
    ) {
      port.disconnect();
      return;
    }
    let disconnected = false;
    let queue = ready;
    port.onDisconnect.addListener(() => {
      disconnected = true;
      ports.delete(port);
    });
    port.onMessage.addListener((message: { id: number; action: string }) => {
      queue = queue
        .then(async () => {
          if (disconnected) return;
          try {
            if (
              !Number.isSafeInteger(message.id) ||
              typeof message.action !== "string"
            )
              throw new Error("Invalid state request");
            const action = deserializeState<UnknownAction>(message.action);
            if (!action || !allowedActions.has(action.type))
              throw new Error("Unsupported state action");
            store.dispatch(action);
            // Acknowledgement means the update survived, even if the popup closes.
            await flush();
            post(port, { type: "result", id: message.id, state: snapshot() });
          } catch (error) {
            post(port, {
              type: "error",
              id: message.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })
        .catch(() => {
          /* readiness failure is sent below */
        });
    });
    void ready.then(
      () => {
        if (disconnected) return;
        ports.add(port);
        const state = snapshot();
        lastBroadcast = state;
        post(port, { type: "state", state });
      },
      () => {
        post(port, {
          type: "fatal",
          error:
            "Unable to restore wallet state. Reload the extension to retry.",
        });
      },
    );
  };
  runtime.onConnect.addListener(onConnect);
  return () => {
    runtime.onConnect.removeListener(onConnect);
    unsubscribe();
    for (const port of ports) port.disconnect();
  };
}
