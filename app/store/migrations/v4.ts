import { type RootState } from "../store";
import { type MultiChainModel } from "../multiChain";
import { DEFAULT_USER_SELECTED_CHAINS } from "core/constants/chain";

export const migrationV4 = (state: RootState): RootState => {
  try {
    console.log("migrationV4 start....");
    const { allWalletInfo, walletBackupMnemonicMap, showBalance } =
      state.account || {};
    const multiChain: MultiChainModel = {
      chainConfigItems: [],
      walletChainMap: {},
    };
    const walletIds = Object.keys(allWalletInfo);
    walletIds.forEach((walletId) => {
      multiChain.walletChainMap[walletId] = {
        userSelectedChains: [...DEFAULT_USER_SELECTED_CHAINS],
      };
    });

    const newAccountModel = {
      ...state.accountV2,
      walletBackupMnemonicMap,
      showBalance,
    };

    return {
      ...state,
      multiChain,
      accountV2: newAccountModel,
    };
  } catch (err) {
    console.log(err);
    return state;
  }
};
