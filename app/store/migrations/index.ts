import { migrationV2 } from "./v2";
import { migrationV3 } from "./v3";
import { migrationV4 } from "./v4";
import { migrationV5 } from "./v5";

import { migrationV6 } from "./v6";

export const version = 6;

export const migrations = {
  2: migrationV2,
  3: migrationV3,
  4: migrationV4,
  5: migrationV5,
  6: migrationV6,
};
