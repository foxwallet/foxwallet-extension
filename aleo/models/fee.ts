import { Transition } from "./transition";

export type Fee = {
  transition: Transition;
  global_state_root: string;
  proof: string;
};
