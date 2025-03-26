import { useDispatch, useSelector, type EqualityFn } from "react-redux";
import type { Dispatch, RootState } from "@/store/store";
import type { UseSelectorOptions } from "react-redux/es/hooks/useSelector";

export const usePopupDispatch = useDispatch<Dispatch>;

export declare type CheckFrequency = "never" | "once" | "always";

export interface UseSelector<TState> {
  <Selected = unknown>(
    selector: (state: TState) => Selected,
    equalityFn?: EqualityFn<Selected>,
  ): Selected;
  <Selected = unknown>(
    selector: (state: TState) => Selected,
    options?: UseSelectorOptions<Selected>,
  ): Selected;
}

export const usePopupSelector: UseSelector<RootState> = useSelector;
