import { useDispatch } from "react-redux";
import { type Dispatch } from "../store/store";

export const useWalletDispatch = useDispatch<Dispatch>;
