import { useSelector } from "react-redux";
import { type RootState } from "../store/store";

export const useAppStatus = () => {
  const status = useSelector((state: RootState) => state.user);

  return status;
};
