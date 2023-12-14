import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { isEqual } from "lodash";
import { useEffect } from "react";
import { CoinType } from "core/types";

export const useCurrAccount = () => {
  const { selectedAccount, selectedUniqueId } = usePopupSelector(
    (state) => ({
      selectedAccount: state.account.selectedAccount,
      selectedUniqueId: state.account.selectedUniqueId,
    }),
    isEqual,
  );
  const dispatch = usePopupDispatch();

  useEffect(() => {
    dispatch.account.getSelectedAccount(CoinType.ALEO);
  }, []);

  return { selectedAccount, uniqueId: selectedUniqueId };
};
