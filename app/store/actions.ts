import { slices } from "./index";
import { accountV2Thunks } from "./thunks/accountV2";
import { addressThunks } from "./thunks/address";
import { multiChainThunks } from "./thunks/multiChain";
import { settingThunks } from "./thunks/setting";
import { walletThunks } from "./thunks/wallet";

export const actions = {
  user: slices.user.actions,
  account: slices.account.actions,
  accountV2: { ...slices.accountV2.actions, ...accountV2Thunks },
  address: { ...slices.address.actions, ...addressThunks },
  multiChain: { ...slices.multiChain.actions, ...multiChainThunks },
  setting: { ...slices.setting.actions, ...settingThunks },
  wallet: { ...slices.wallet.actions, ...walletThunks },
  tokens: slices.tokens.actions,
  coinPriceV2: slices.coinPriceV2.actions,
  coinBalanceV2: slices.coinBalanceV2.actions,
};
