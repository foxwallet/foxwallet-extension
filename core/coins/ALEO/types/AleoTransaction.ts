import { Execution } from "./AleoExecution";
import { Fee } from "./AleoFee";

export type Transaction = {
  type: string;
  id: string;
  execution: Execution;
  fee?: Fee;
};
