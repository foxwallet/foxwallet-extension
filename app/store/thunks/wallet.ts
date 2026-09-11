import { isEqual } from "lodash";
import { type WalletType } from "@/scripts/background/store/vault/types/keyring";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";
import { actions } from "../actions";
import type { AppThunk } from "../types";

export const walletThunks = {
  selectChain(payload: {
    walletId: string;
    selectedChain: ChainDisplayMode;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const { walletId, selectedChain: chainDisplayMode } = payload;
      await dispatch(
        actions.wallet._updateSelectedChain({
          walletId,
          chainDisplayMode,
        }),
      );
    };
  },
};
