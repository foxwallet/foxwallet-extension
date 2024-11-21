import { type WalletType } from "@/scripts/background/store/vault/types/keyring";
import { createModel } from "@rematch/core";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";
import { type RootModel } from ".";
import { isEqual } from "lodash";

export type AccountMatchingMeta = {
  walletType: WalletType;
  walletId: string;
  groupId: string;
  accountId: string;
};

export type ChainDisplayMap = {
  [walletId: string]: ChainDisplayMode | undefined;
};

type WalletModel = {
  selectedChain?: ChainDisplayMap;
};

export const DEFAULT_CHAIN_DISPLAY_MODE: ChainDisplayMode = {
  mode: ChainAssembleMode.ALL,
};

const defaultWallet = {
  selectedChain: {},
} as WalletModel;

export const wallet = createModel<RootModel>()({
  name: "wallet",
  state: defaultWallet,
  reducers: {
    _resetWallet() {
      return defaultWallet;
    },
    _updateSelectedChain(
      state,
      payload: { walletId: string; chainDisplayMode: ChainDisplayMode },
    ): WalletModel {
      const { walletId, chainDisplayMode } = payload;
      const { selectedChain } = state;
      const existChainMode = selectedChain?.[walletId];
      if (isEqual(existChainMode, chainDisplayMode)) {
        return state;
      }
      return {
        ...state,
        selectedChain: {
          ...selectedChain,
          [walletId]: chainDisplayMode,
        },
      };
    },
  },
  effects: (dispatch) => ({
    selectChain(payload: {
      walletId: string;
      selectedChain: ChainDisplayMode;
    }) {
      const { walletId, selectedChain: chainDisplayMode } = payload;
      dispatch.wallet._updateSelectedChain({
        walletId,
        chainDisplayMode,
      });
    },
  }),
});
