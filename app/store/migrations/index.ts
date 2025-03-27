import { migrationV2 } from "./v2";
import { migrationV3 } from "./v3";
import { migrationV4 } from "./v4";

export const version = 4;

export const migrations = {
  2: migrationV2,
  3: migrationV3,
  4: migrationV4,
};
