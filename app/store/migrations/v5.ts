import { type RootState } from "../store";
import { DEFAULT_USER_SELECTED_CHAINS } from "core/constants/chain";

/**
 * v5 migration: Add QTUM chains to existing wallets' userSelectedChains.
 * Existing wallets created before QTUM support won't have QTUM in their
 * selected chains. This migration merges missing default chains in.
 */
export const migrationV5 = (state: RootState): RootState => {
  try {
    console.log("migrationV5 start....");
    const multiChain = state.multiChain;
    if (!multiChain?.walletChainMap) {
      return state;
    }

    const newWalletChainMap = { ...multiChain.walletChainMap };

    for (const walletId of Object.keys(newWalletChainMap)) {
      const chainItem = newWalletChainMap[walletId];
      if (!chainItem) continue;

      const existing = chainItem.userSelectedChains || [];
      // Add any default chains that are missing
      const missing = DEFAULT_USER_SELECTED_CHAINS.filter(
        (id) => !existing.includes(id),
      );

      if (missing.length > 0) {
        newWalletChainMap[walletId] = {
          ...chainItem,
          userSelectedChains: [...existing, ...missing],
        };
      }
    }

    return {
      ...state,
      multiChain: {
        ...multiChain,
        walletChainMap: newWalletChainMap,
      },
    };
  } catch (err) {
    console.log(err);
    return state;
  }
};
