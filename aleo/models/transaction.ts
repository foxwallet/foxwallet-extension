import { Execution } from "./execution";
import { Fee } from "./fee";

export type Transaction = {
  type: string;
  id: string;
  execution: Execution;
  fee?: Fee;
};
