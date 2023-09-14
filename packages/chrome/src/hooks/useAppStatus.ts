import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useAppStatus = () => {
  const status = useSelector((state: RootState) => state.user);

  return status;
};
