import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { RootState } from "../store";
import { MultiChainModel } from "../multiChain";

export const migrationV3 = (state: RootState): RootState => {
  try {
    console.log("migrationV3 start....");
    const { allWalletInfo, walletBackupMnemonicMap, showBalance } =
      state.account || {};
    const multiChain: MultiChainModel = {
      chainConfigItems: [],
      walletChainMap: {},
    };
    const walletIds = Object.keys(allWalletInfo);
    walletIds.forEach((walletId) => {
      multiChain.walletChainMap[walletId] = {
        userSelectedChains: [InnerChainUniqueId.ALEO_TESTNET],
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