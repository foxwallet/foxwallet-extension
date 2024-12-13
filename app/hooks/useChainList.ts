import { useSelector } from "react-redux";
import { isEqual } from "lodash";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type RootState } from "@/store/store";
import { groupAccountAvailableNetworksSelector } from "@/store/selectors/account";

export const useGroupAccountChainList = () => {
  const coinChainList: ChainBaseConfig[] = useSelector((state: RootState) => {
    return groupAccountAvailableNetworksSelector(state);
  }, isEqual);
  return coinChainList;
};
