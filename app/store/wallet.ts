import { isEqual } from "lodash";
import { type WalletType } from "@/scripts/background/store/vault/types/keyring";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";

export type AccountMatchingMeta = {
  walletType: WalletType;
  walletId: string;
  groupId: string;
  accountId: string;
};

export type ChainDisplayMap = {
  [walletId: string]: ChainDisplayMode | undefined;
};

export type GroupAccountMatchingMeta = {
  walletType: WalletType;
  walletId: string;
  groupId: string;
};

type WalletModel = {
  selectedAccountMeta?: GroupAccountMatchingMeta;
  selectedChain?: ChainDisplayMap;
};

export const DEFAULT_CHAIN_DISPLAY_MODE: ChainDisplayMode = {
  mode: ChainAssembleMode.ALL,
};

const defaultWallet = {
  selectedChain: {},
} as WalletModel;

export const wallet = createSlice({
  name: "wallet",
  initialState: defaultWallet,
  reducers: {
    _reset() {
      return defaultWallet;
    },
    _updateSelectedChain(
      state,
      action: PayloadAction<{
        walletId: string;
        chainDisplayMode: ChainDisplayMode;
      }>,
    ): WalletModel {
      const payload = action.payload;
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
});
