import { useDispatch, useSelector, type EqualityFn } from "react-redux";
import type { Dispatch, RootState } from "@/store/store";
import type { TypedUseSelectorHook } from "react-redux";

export const usePopupDispatch = useDispatch<Dispatch>;

export const usePopupSelector: TypedUseSelectorHook<RootState> = useSelector;
