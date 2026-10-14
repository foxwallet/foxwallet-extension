import { isEqual } from "lodash";
import { usePopupSelector } from "./useStore";

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
