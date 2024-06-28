import { migrationV2 } from "./v2";

export const version = 2;

// from v50 all multiChainV3 updates deleted, older deleted too
export const migrations = {
  2: migrationV2,
};
