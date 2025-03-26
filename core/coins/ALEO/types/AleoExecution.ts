import { type Transition } from "./AleoTransition";

export type Execution = {
  edition: number;
  transitions?: Transition[];
};
