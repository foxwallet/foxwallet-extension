import { useDispatch } from "react-redux";
import { Dispatch } from "../store/store";

export const useWalletDispatch = useDispatch<Dispatch>;