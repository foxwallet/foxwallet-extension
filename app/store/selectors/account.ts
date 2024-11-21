import { createSelector } from "reselect";
import { type RootState } from "../store";
import { DEFAULT_CHAIN_DISPLAY_MODE } from "../wallet";
import { type DisplayWallet } from "@/scripts/background/store/vault/types/keyring";
import { INNER_CHAIN_CONFIG } from "core/helper/CoinType";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { mergeLocalChainConfig } from "@/services/coin/CoinService";
import {
  ChainAssembleMode,
  type ChainUniqueId,
} from "core/types/ChainUniqueId";
import { uniq } from "lodash";
import { matchAccountsWithUnqiueId } from "../accountV2";

const createAppSelector = createSelector.withTypes<RootState>();

export const accountSelector = (state: RootState) => state.accountV2;

export const selectedGroupAccountSelector = (state: RootState) =>
  state.accountV2.selectedGroupAccount;

export const selectChainSelector = (state: RootState) => {
  return state.wallet.selectedChain;
};

export const walletChainMapSelector = (state: RootState) => {
  return state.multiChain.walletChainMap;
};

export const chainConfigItemsSelector = (state: RootState) => {
  return state.multiChain.chainConfigItems;
};

export const chainModeSelector = createAppSelector(
  selectedGroupAccountSelector,
  selectChainSelector,
  (groupAccount, selectedChain) => {
    console.log("===> selector chainModeSelector");
    if (groupAccount && selectedChain) {
      return (
        selectedChain[groupAccount.wallet.walletId] ??
        DEFAULT_CHAIN_DISPLAY_MODE
      );
    }
    return DEFAULT_CHAIN_DISPLAY_MODE;
  },
);

export const dupGroupNameSelector = createAppSelector(
  [
    accountSelector,
    (_state, { walletId }: { walletId: string }) => walletId,
    (_state, { groupName }: { groupName: string }) => groupName,
  ],
  (account, walletId, groupName) => {
    const allWallets = account.allWalletInfo;
    const dup = Object.values(allWallets).some((wallet) => {
      if (wallet.walletId !== walletId) {
        return false;
      }
      const sameAccountIndex = wallet.groupAccounts.findIndex(
        (item) => item.groupName === groupName,
      );
      return sameAccountIndex >= 0;
    });
    return dup;
  },
);

export const walletByIdSelector = createAppSelector(
  [accountSelector, (_state, { walletId }: { walletId: string }) => walletId],
  (account, walletId) => {
    const allWallets = account.allWalletInfo;
    const wallet = allWallets[walletId];
    return wallet as DisplayWallet | undefined;
  },
);

export const allChainConfigsSelector = createAppSelector(
  [chainConfigItemsSelector],
  (chainConfigs) => {
    const innerConfigs = INNER_CHAIN_CONFIG;
    const configs: ChainBaseConfig[] = [];
    for (const chainConfig of chainConfigs) {
      configs.push(mergeLocalChainConfig(chainConfig.uniqueId, chainConfig));
    }
    for (const innerConfig of innerConfigs) {
      if (configs.some((item) => item.uniqueId === innerConfig.uniqueId)) {
        continue;
      }
      configs.push({
        ...innerConfig,
      });
    }
    return configs;
  },
);

export const groupAccountAvailableNetworksSelector = createAppSelector(
  selectedGroupAccountSelector,
  allChainConfigsSelector,
  (groupAccount, allChainConfigs) => {
    console.log("===> selector allNetworksSelector");
    if (!groupAccount) {
      return [];
    }
    return allChainConfigs.filter((item) => {
      const matchAccount = matchAccountsWithUnqiueId(
        groupAccount,
        item.uniqueId,
      );
      return matchAccount.length > 0;
    });
  },
);

export const currChainUniqueIdsSelector = createAppSelector(
  chainModeSelector,
  selectedGroupAccountSelector,
  walletChainMapSelector,
  groupAccountAvailableNetworksSelector,
  allChainConfigsSelector,
  (chainMode, groupAccount, walletChainMap, allNetworks, allConfigs) => {
    if (!groupAccount) {
      throw new Error("groupAccount is null");
    }
    if (chainMode.mode === ChainAssembleMode.ALL) {
      const uniqueIds = uniq(
        walletChainMap[groupAccount.wallet.walletId]?.userSelectedChains ??
          allNetworks.map((item) => item.uniqueId),
      );
      return uniqueIds.filter((uniqueId: ChainUniqueId) => {
        return allConfigs.some((item) => item.uniqueId === uniqueId);
      });
    }
    return [chainMode.uniqueId];
  },
);

export const currChainConfigsSelector = createAppSelector(
  currChainUniqueIdsSelector,
  chainConfigItemsSelector,
  (chainUniqueIds, chainConfigItems) => {
    console.log("===> selector currChainConfigsSelector");
    return chainUniqueIds.map((uniqueId) => {
      const config = chainConfigItems?.filter(
        (item) => item.uniqueId === uniqueId,
      )?.[0];
      return mergeLocalChainConfig(uniqueId, config);
    });
  },
);
