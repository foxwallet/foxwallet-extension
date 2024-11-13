import {
  type ALPHA_TOKEN_PROGRAM_ID,
  type BETA_STAKING_PROGRAM_ID,
  type NATIVE_TOKEN_PROGRAM_ID,
} from "../constants";

export type InnerProgramId =
  | typeof NATIVE_TOKEN_PROGRAM_ID
  | typeof ALPHA_TOKEN_PROGRAM_ID
  | typeof BETA_STAKING_PROGRAM_ID;
