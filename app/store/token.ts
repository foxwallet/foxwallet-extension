import { createModel } from "@rematch/core";
import { type RootModel } from ".";
import {
  type ChainUniqueId,
  type InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type Token } from "core/coins/ALEO/types/Token";
import { type TokenV2 } from "core/types/Token";

export type TokenMap = {
  [address: string]: TokenV2[] | undefined;
};

export type UserTokensMap = {
  [uniqueId in InnerChainUniqueId]?: TokenMap;
};

export type HasInitTokensByInteractiveTokens = {
  [uniqueId in ChainUniqueId]?: { [address: string]: boolean | undefined };
};

export type TokenMaps = {
  userTokens: UserTokensMap;
  hasInitTokensByInteractiveTokens: HasInitTokensByInteractiveTokens;
};

const defaultTokenMaps: TokenMaps = {
  userTokens: {},
  hasInitTokensByInteractiveTokens: {},
};

export const tokens = createModel<RootModel>()({
  name: "tokens",
  state: defaultTokenMaps,
  reducers: {
    initAddressTokens(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        tokens: TokenV2[];
      },
    ) {
      const { uniqueId, address, tokens: addressTokens } = payload;
      const allChainTokens = state.userTokens;
      const userTokens = allChainTokens[uniqueId] ?? {};
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...userTokens,
            [address]: [...addressTokens],
          },
        },
      };
    },

    selectToken(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        token: TokenV2;
      },
    ) {
      const { uniqueId, address, token } = payload;
      const allChainTokens = state.userTokens;
      const userTokens = allChainTokens[uniqueId] ?? {};
      const addressTokens = userTokens[address] ?? [];
      const exist = addressTokens.some((item: TokenV2) => {
        return item.tokenId === token.tokenId;
      });
      if (exist) {
        return state;
      }
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...userTokens,
            [address]: [...addressTokens, { ...token }],
          },
        },
      };
    },

    unselectToken(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        token: TokenV2;
      },
    ) {
      const { uniqueId, address, token } = payload;
      const allChainTokens = state.userTokens;
      const userTokens = allChainTokens[uniqueId] ?? {};
      const addressTokens = userTokens[address] ?? [];
      const newTokens = addressTokens.filter((item: TokenV2) => {
        return item.tokenId !== token.tokenId;
      });
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...userTokens,
            [address]: newTokens,
          },
        },
      };
    },

    changeHasInitTokensByInteractiveTokensState(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        newInitState: boolean;
      },
    ) {
      const { uniqueId, address, newInitState } = payload;
      const { hasInitTokensByInteractiveTokens } = state;
      const addressInitState =
        hasInitTokensByInteractiveTokens?.[uniqueId] ?? {};
      return {
        ...state,
        hasInitTokensByInteractiveTokens: {
          ...hasInitTokensByInteractiveTokens,
          [uniqueId]: {
            ...addressInitState,
            [address]: newInitState,
          },
        },
      };
    },
  },
  effects: (dispatch) => ({}),
});
