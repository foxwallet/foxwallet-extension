import { migrationV2 } from "./v2";
import { migrationV3 } from "./v3";

export const version = 3;

// from v50 all multiChainV3 updates deleted, older deleted too
export const migrations = {
  2: migrationV2,
  3: migrationV3,
};
