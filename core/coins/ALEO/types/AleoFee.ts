import { type Transition } from "./AleoTransition";

export type Fee = {
  transition: Transition;
  global_state_root: string;
  proof: string;
};
