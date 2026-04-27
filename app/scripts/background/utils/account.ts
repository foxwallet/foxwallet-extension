import { ChainUniqueId } from "core/types/ChainUniqueId";
import {
  GroupAccount,
  OneMatchAccount,
  OneMatchGroupAccount,
} from "../store/vault/types/keyring";
import { chainUniqueIdToAccountOptions, chainUniqueIdToCoinType } from "core/helper/CoinType";
import { isEqual } from "lodash";

export const matchAccountFromGroupAccount = (
  groupAccount: OneMatchGroupAccount,
  uniqueId: ChainUniqueId,
): OneMatchAccount | null => {
  const { wallet, group } = groupAccount;
  const { accounts, ...restGroup } = group;
  const coinType = chainUniqueIdToCoinType(uniqueId);
  const options = chainUniqueIdToAccountOptions(
    uniqueId,
    groupAccount.wallet.walletType
  );
  const account = accounts.find(
    (account) =>
      account.coinType === coinType &&
      options.some((option) => isEqual(account.option, option)),
  );
  if (!account) {
    return null;
  }
  return {
    wallet,
    group: restGroup,
    account,
  };
};
