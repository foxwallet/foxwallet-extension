import { usePopupSelector } from "./useStore";
import { isEqual } from "lodash";

/**
 * @deprecated
 */
export const useCurrAccount = () => {
  const { selectedAccount, selectedUniqueId } = usePopupSelector(
    (state) => ({
      selectedAccount: state.account.selectedAccount,
      selectedUniqueId: state.account.selectedUniqueId,
    }),
    isEqual,
  );

  return { selectedAccount, uniqueId: selectedUniqueId };
};
