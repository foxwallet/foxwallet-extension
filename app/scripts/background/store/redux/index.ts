import { setStateReader } from "@/store/currentState";
import { appStorageInstance } from "@/common/utils/indexeddb";
import { actionTypes } from "@/store";
import { createPersistedStore } from "@/store/persistence";
import { connectStoreServer } from "@/store/bridge";

let stateService: ReturnType<typeof createPersistedStore> | undefined;
export function initializeBackgroundStore() {
  if (stateService) return stateService;
  stateService = createPersistedStore(appStorageInstance);
  setStateReader(stateService.store.getState);
  connectStoreServer(chrome.runtime, stateService.store, stateService.ready, () => stateService!.flush(), actionTypes);
  return stateService;
}
export async function getBackgroundState() {
  const service = initializeBackgroundStore();
  await service.ready;
  return service.store.getState();
}
