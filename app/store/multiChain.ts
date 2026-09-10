import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
import { produce } from "immer";

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

export const multiChain = createSlice({
  name: "multiChain",
  initialState: {
    chainConfigItems: [],
    walletChainMap: {},
  } as MultiChainModel,
  reducers: {
    _addChainConfig(
      state,
      action: PayloadAction<{
        chainConfigItems: ChainConfigItems;
        walletChainMap: WalletChainMap;
      }>,
    ) {
      const payload = action.payload;
      return {
        ...state,
        chainConfigItems: payload.chainConfigItems,
        walletChainMap: payload.walletChainMap,
      } as MultiChainModel;
    },

    changeChainConfig(
      state,
      action: PayloadAction<{ chainConfig: ChainBaseConfig }>,
    ) {
      const payload = action.payload;
      return produce(state, (draftState) => {
        const { chainConfig } = payload;
        const uniqueId = chainConfig.uniqueId;
        if (!uniqueId) {
          return;
        }

        draftState.chainConfigItems = draftState.chainConfigItems ?? [];
        const index = draftState.chainConfigItems.findIndex(
          (config) => config.uniqueId === uniqueId,
        );

        if (index < 0) {
          console.log(
            `changeChainConfig ${uniqueId} isn't exist in ${JSON.stringify(
              chainConfig,
            )}`,
          );
          draftState.chainConfigItems.push(chainConfig);
        } else {
          draftState.chainConfigItems[index] = { ...chainConfig };
        }
      });
    },

    removeChainConfig(
      state,
      action: PayloadAction<{ chainConfig: ChainBaseConfig }>,
    ) {
      const payload = action.payload;
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

      const walletChainMap = { ...state.walletChainMap };
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
      action: PayloadAction<{
        walletId: string;
        uniqueId: ChainUniqueId;
        select?: boolean;
      }>,
    ) {
      const payload = action.payload;
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
      action: PayloadAction<{
        walletId: string;
        uniqueId: ChainUniqueId;
        walletType: WalletType;
      }>,
    ) {
      const payload = action.payload;
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
    resetWalletChainItem(state, action: PayloadAction<{ walletId: string }>) {
      const payload = action.payload;
      const { walletId } = payload;
      return {
        ...state,
        walletChainMap: {
          ...state.walletChainMap,
          [walletId]: undefined,
        },
      };
    },
    _addHdWalletChainItem(state, action: PayloadAction<{ walletId: string }>) {
      const payload = action.payload;
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
      action: PayloadAction<{
        walletId: string;
        coinType: CoinType;
        option: AccountOption[CoinType];
      }>,
    ) {
      const payload = action.payload;
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
      action: PayloadAction<{
        walletId: string;
        coinType: CoinType;
        options: Array<AccountOption[CoinType]>;
      }>,
    ) {
      const payload = action.payload;
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
});
