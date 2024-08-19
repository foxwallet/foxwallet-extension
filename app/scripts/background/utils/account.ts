import { ChainUniqueId } from "core/types/ChainUniqueId";
import {
  GroupAccount,
  OneMatchAccount,
  OneMatchGroupAccount,
} from "../store/vault/types/keyring";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";

export const matchAccountFromGroupAccount = (
  groupAccount: OneMatchGroupAccount,
  uniqueId: ChainUniqueId,
): OneMatchAccount | null => {
  const { wallet, group } = groupAccount;
  const { accounts, ...restGroup } = group;
  const coinType = chainUniqueIdToCoinType(uniqueId);
  // TODO: need to compare chain option in the future
  const account = accounts.find((account) => account.coinType === coinType);
  if (!account) {
    return null;
  }
  return {
    wallet,
    group: restGroup,
    account,
  };
};
