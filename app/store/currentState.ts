import type { RootState } from "./types";

let readState: (() => RootState) | undefined;
// Each extension realm installs its own reader. Shared service helpers never
// create a popup connection or a second persistent store as an import side effect.
export function setStateReader(reader: () => RootState) { readState = reader; }
export function getCurrentState(): RootState {
  if (!readState) throw new Error("Wallet state is not initialized");
  return readState();
}
