import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { useContext } from "react";
import { useClient } from "./useClient";

export const useAppStatus = () => {
  const status = useSelector((state: RootState) => state.user);
  return status;
};
