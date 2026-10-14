import type { RootState } from "../types";

// State fields and storage keys stay compatible. Drop only the removed plugin's
// transient loading counters; none of the wallet, preference or cache data moves.
export const migrationV6 = (state: RootState & { loading?: unknown }) => {
  const { loading, ...rest } = state;
  return rest;
};
