import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type RootState } from "../store";
import { type MultiChainModel } from "../multiChain";

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
        userSelectedChains: [InnerChainUniqueId.ALEO_MAINNET],
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
