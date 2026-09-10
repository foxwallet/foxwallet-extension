import type {
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";
import type { RootState } from "./index";

export type AppThunk<Return = void> = ThunkAction<
  Return,
  RootState,
  unknown,
  UnknownAction
>;
export type Dispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
export type { RootState };
