import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { isSameAddress } from "core/utils/address";
import { addressApi } from "@/services/api/address";
import { nanoid } from "nanoid";
import { actions } from "../actions";
import type { AppThunk } from "../types";

export const addressThunks = {
  fetchNameTag(queryAddress: string): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      const nameTagItem = await addressApi.getNameTag(queryAddress);
      await dispatch(actions.address.setNameTag({ item: nameTagItem }));
    };
  },
};
