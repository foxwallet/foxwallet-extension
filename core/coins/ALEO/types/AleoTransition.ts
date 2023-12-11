import { Input } from "./AleoInput";
import { Output } from "./AleoOutput";

export type Transition = {
  id: string;
  program: string;
  function: string;
  inputs?: Input[];
  outputs?: Output[];
  proof: string;
  tpk: string;
  tcm: string;
};
