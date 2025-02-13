import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
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
import { walletByIdSelector } from "./selectors/account";

export type ChainConfigItems = ChainBaseConfig[];

export type ChainMap = {
  userSelectedChains: ChainUniqueId[];
};

export type WalletChainMap = {
  [walletId: string]: ChainMap | undefined;
};

export type MultiChainModel = {
  chainConfigItems: ChainConfigItems;
  walletChainMap: WalletChainMap;
};

export const multiChain = createModel<RootModel>()({
  name: "multiChain",
  state: {
    chainConfigItems: [],
    walletChainMap: {},
  } as MultiChainModel,
  reducers: {
    _addChainConfig(
      state,
      payload: {
        chainConfigItems: ChainConfigItems;
        walletChainMap: WalletChainMap;
      },
    ) {
      return {
        ...state,
        chainConfigItems: payload.chainConfigItems,
        walletChainMap: payload.walletChainMap,
      } as MultiChainModel;
    },

    changeChainConfig(state, payload: { chainConfig: ChainBaseConfig }) {
      const { chainConfig } = payload;
      const uniqueId = chainConfig.uniqueId;
      if (!uniqueId) {
        return state;
      }
      const chainConfigItems = state.chainConfigItems ?? [];
      const index = chainConfigItems.findIndex(
        (config) => config.uniqueId === uniqueId,
      );
      if (index < 0) {
        console.log(
          `changeChainConfig ${uniqueId} isn't exist in ${JSON.stringify(
            chainConfig,
          )}`,
        );
        return {
          ...state,
          chainConfigItems: [...chainConfigItems, chainConfig],
        };
      }
      chainConfigItems[index] = { ...chainConfig };
      return {
        ...state,
        chainConfigItems,
      } as MultiChainModel;
    },

    removeChainConfig(state, payload: { chainConfig: ChainBaseConfig }) {
      const { chainConfig } = payload;
      const { uniqueId } = chainConfig;
      if (INNER_CHAIN_CONFIG.some((item) => item.uniqueId === uniqueId)) {
        console.log("Can't remove inner config");
        return state;
      }
      let chainConfigItems = state.chainConfigItems ?? [];

      chainConfigItems = chainConfigItems.filter((item: ChainBaseConfig) => {
        return item.uniqueId !== uniqueId;
      });

      const walletChainMap = state.walletChainMap;
      for (const [walletId, chainMap] of Object.entries(walletChainMap)) {
        if (!chainMap) {
          console.error(
            `removeChainConfig walletId ${walletId} isn't exist in walletChainMap`,
          );
          continue;
        }
        const userSelectedChains: ChainUniqueId[] = chainMap.userSelectedChains;
        const newUserSelectedChains = userSelectedChains.filter(
          (id) => id !== uniqueId,
        );

        walletChainMap[walletId] = {
          ...chainMap,
          userSelectedChains: newUserSelectedChains,
        };
      }

      return {
        ...state,
        chainConfigItems: [...chainConfigItems],
        walletChainMap: {
          ...walletChainMap,
        },
      } as MultiChainModel;
    },

    _addUserSelectedChain(
      state,
      payload: {
        walletId: string;
        uniqueId: ChainUniqueId;
        select?: boolean;
      },
    ) {
      const { walletId, uniqueId } = payload;
      const chainMap: ChainMap | undefined = state.walletChainMap[walletId];
      if (!chainMap) {
        console.error(`walletId ${walletId} isn't exist in walletChainMap`);
        return state;
      }
      const userSelectedChains = chainMap.userSelectedChains || [];
      const exist = userSelectedChains.some((id) => id === uniqueId);
      if (exist) {
        return state;
      }
      const newChainMap: ChainMap = {
        ...chainMap,
        userSelectedChains: [...userSelectedChains, uniqueId],
      };

      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: newChainMap,
        },
      } as MultiChainModel;
    },
    // 如果是私钥钱包，那么不允许移除默认链，如果是助记词钱包，不允许移除eth主网
    _removeUserSelectedChain(
      state,
      payload: {
        walletId: string;
        uniqueId: ChainUniqueId;
        walletType: WalletType;
      },
    ) {
      const { walletId, uniqueId, walletType } = payload;
      const chainMap: ChainMap | undefined = state.walletChainMap[walletId];
      if (!chainMap) {
        console.error(`walletId ${walletId} isn't exist in walletChainMap`);
        return state;
      }
      // if (walletType === WalletType.SIMPLE) {
      //   return state;
      // }
      // if (uniqueId === InnerChainUniqueId.ETHEREUM) {
      //   console.log(`Can't unselect ${InnerChainUniqueId.ETHEREUM} chain.`);
      //   return state;
      // }
      const userSelectedChains = chainMap.userSelectedChains || [];
      const newUserSelectedChains = userSelectedChains.filter(
        (id) => id !== uniqueId,
      );

      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: {
            ...chainMap,
            userSelectedChains: newUserSelectedChains,
          },
        },
      } as MultiChainModel;
    },
    _reset() {
      return {
        chainConfigItems: [],
        walletChainMap: {},
      };
    },
    resetWalletChainMap(state) {
      return {
        ...state,
        walletChainMap: {},
      };
    },
    resetWalletChainItem(state, payload: { walletId: string }) {
      const { walletId } = payload;
      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: undefined,
        },
      };
    },
    _addHdWalletChainItem(state, payload: { walletId: string }) {
      const { walletId } = payload;
      // 由于存在在添加网络时添加账户的操作，所以暂时不继承其他钱包的已选择网络
      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: {
            userSelectedChains: [...DEFAULT_USER_SELECTED_CHAINS],
          },
        },
      } as MultiChainModel;
    },
    addSimpleWalletChainItem(
      state,
      payload: {
        walletId: string;
        coinType: CoinType;
        option: AccountOption[CoinType];
      },
    ) {
      const { walletId, coinType, option } = payload;
      const defaultChain = [getDefaultChainUniqueId(coinType, option)];
      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: {
            userSelectedChains: defaultChain,
          },
        },
      } as MultiChainModel;
    },
    batchAddSimpleWalletChainItem(
      state,
      payload: {
        walletId: string;
        coinType: CoinType;
        options: Array<AccountOption[CoinType]>;
      },
    ) {
      const { walletId, coinType, options } = payload;
      const defaultChains = options.map((option) =>
        getDefaultChainUniqueId(coinType, option),
      );
      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: {
            userSelectedChains: defaultChains,
          },
        },
      } as MultiChainModel;
    },
  },
  effects: (dispatch) => ({
    // select uses top store, effect instead of reducer
    addChainConfig(payload: { chainConfig: ChainBaseConfig }, state) {
      const { chainConfig } = payload;
      const uniqueId = chainConfig.uniqueId;
      const chainConfigItems: ChainConfigItems =
        state.multiChain.chainConfigItems || [];
      const exist = chainConfigItems.some(
        (config) => config.uniqueId === uniqueId,
      );
      if (!exist) {
        chainConfigItems.push(chainConfig);
      }
      const walletChainMap: WalletChainMap = state.multiChain.walletChainMap;
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

      dispatch.multiChain._addChainConfig({
        chainConfigItems: [...chainConfigItems],
        walletChainMap: {
          ...walletChainMap,
        },
      });
    },
    addHdWalletChainItem(payload: { walletId: string }) {
      const { walletId } = payload;
      dispatch.multiChain._addHdWalletChainItem({
        walletId,
      });
    },
    addUserSelectedChain(payload: {
      walletId: string;
      uniqueId: ChainUniqueId;
      select?: boolean;
    }) {
      dispatch.multiChain._addUserSelectedChain(payload);
    },
    removeUserSelectedChain(
      payload: {
        walletId: string;
        uniqueId: ChainUniqueId;
      },
      state,
    ) {
      const walletById = walletByIdSelector(state as any, {
        walletId: payload.walletId,
      });
      if (!walletById) {
        return;
      }
      dispatch.multiChain._removeUserSelectedChain({
        ...payload,
        walletType: walletById.walletType,
      });
    },
  }),
});
