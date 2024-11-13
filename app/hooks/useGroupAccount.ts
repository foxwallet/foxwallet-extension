import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useCallback, useEffect } from "react";
import { selectedGroupAccountSelector } from "@/store/selectors/account";
import { matchAccountsWithUnqiueId } from "@/store/accountV2";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { isEqual } from "lodash";

export const useGroupAccount = () => {
  const groupAccount = usePopupSelector(
    (state) => selectedGroupAccountSelector(state),
    isEqual,
  );

  const dispatch = usePopupDispatch();

  useEffect(() => {
    void dispatch.accountV2.getSelectedGroupAccount();
  }, []);

  const getMatchAccountsWithUniqueId = useCallback(
    (uniqueId: ChainUniqueId) => {
      const accounts = matchAccountsWithUnqiueId(groupAccount, uniqueId);
      const { accounts: _, ...restGroup } = groupAccount.group;
      return accounts.map((account) => {
        const accountInfo: OneMatchAccount = {
          wallet: groupAccount.wallet,
          group: restGroup,
          account,
        };
        return accountInfo;
      });
    },
    [groupAccount],
  );

  return {
    groupAccount,
    getMatchAccountsWithUniqueId,
  };
};
