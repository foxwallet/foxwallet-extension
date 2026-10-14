import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type CoinType } from "core/types";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { INNER_CHAIN_CONFIG } from "core/helper/CoinType";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import {
  DEFAULT_USER_SELECTED_CHAINS,
  getDefaultChainUniqueId,
} from "core/constants/chain";
import { type AccountOption } from "core/types/CoinBasic";
import { walletByIdSelector } from "../selectors/account";
import { produce } from "immer";
import { actions } from "../actions";
import type { AppThunk } from "../types";
import type { ChainConfigItems, WalletChainMap } from "../multiChain";

export const multiChainThunks = {
  addChainConfig(payload: {
    chainConfig: ChainBaseConfig;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const state = getState();

      const { chainConfig } = payload;
      const uniqueId = chainConfig.uniqueId;
      const chainConfigItems: ChainConfigItems = [
        ...(state.multiChain.chainConfigItems || []),
      ];
      const exist = chainConfigItems.some(
        (config) => config.uniqueId === uniqueId,
      );
      if (!exist) {
        chainConfigItems.push(chainConfig);
      }
      const walletChainMap: WalletChainMap = {
        ...state.multiChain.walletChainMap,
      };
      for (const [walletId, chainMap] of Object.entries(walletChainMap)) {
        if (!chainMap) {
          console.error(
            `addChainConfig walletId ${walletId} isn't exist in walletChainMap`,
          );
          continue;
        }
        const walletById = walletByIdSelector(state as any, { walletId });
        if (!walletById) {
          continue;
        }
        if (walletById.walletType === WalletType.SIMPLE) {
          const supportChain = walletById.groupAccounts[0].accounts.some(
            (account) => {
              if (chainConfig.chainOptionFilter) {
                for (const filterKey in chainConfig.chainOptionFilter) {
                  if (
                    account.option?.[
                      filterKey as keyof AccountOption[CoinType]
                    ] !==
                    chainConfig.chainOptionFilter[
                      filterKey as keyof AccountOption[CoinType]
                    ]
                  ) {
                    return false;
                  }
                }
              }
              return account.coinType === chainConfig.coinType;
            },
          );
          // 如果当前钱包不支持该链，跳过
          if (!supportChain) {
            continue;
          }
        }
        const userSelectedChains: ChainUniqueId[] = chainMap.userSelectedChains;
        let newUserSelectedChains: ChainUniqueId[];
        const selected = userSelectedChains.some((id) => id === uniqueId);
        if (selected) {
          newUserSelectedChains = [...userSelectedChains];
        } else {
          newUserSelectedChains = [...userSelectedChains, uniqueId];
        }
        walletChainMap[walletId] = {
          ...chainMap,
          userSelectedChains: newUserSelectedChains,
        };
      }

      await dispatch(
        actions.multiChain._addChainConfig({
          chainConfigItems: [...chainConfigItems],
          walletChainMap: {
            ...walletChainMap,
          },
        }),
      );
    };
  },
  addHdWalletChainItem(payload: { walletId: string }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const { walletId } = payload;
      await dispatch(
        actions.multiChain._addHdWalletChainItem({
          walletId,
        }),
      );
    };
  },
  addUserSelectedChain(payload: {
    walletId: string;
    uniqueId: ChainUniqueId;
    select?: boolean;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      await dispatch(actions.multiChain._addUserSelectedChain(payload));
    };
  },
  removeUserSelectedChain(payload: {
    walletId: string;
    uniqueId: ChainUniqueId;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const state = getState();

      const walletById = walletByIdSelector(state as any, {
        walletId: payload.walletId,
      });
      if (!walletById) {
        return;
      }
      await dispatch(
        actions.multiChain._removeUserSelectedChain({
          ...payload,
          walletType: walletById.walletType,
        }),
      );
    };
  },
};
