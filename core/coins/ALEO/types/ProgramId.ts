import { ALPHA_TOKEN_PROGRAM_ID, NATIVE_TOKEN_PROGRAM_ID } from "../constants";

export type InnerProgramId =
  | typeof NATIVE_TOKEN_PROGRAM_ID
  | typeof ALPHA_TOKEN_PROGRAM_ID;
