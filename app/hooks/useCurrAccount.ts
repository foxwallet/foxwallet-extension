import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupSelector } from "./useStore";
import { isEqual } from "lodash";

export const useCurrAccount = () => {
  const selectedAccount = usePopupSelector(
    (state) => state.account.selectedAccount,
    isEqual,
  );

  return { selectedAccount, uniqueId: InnerChainUniqueId.ALEO_TESTNET_3 };
};
