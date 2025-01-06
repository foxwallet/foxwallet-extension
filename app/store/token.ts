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

export type LastUpdateTimestamp = {
  [uniqueId in ChainUniqueId]?: { [address: string]: number | undefined };
};

export type TokenMaps = {
  userTokens: UserTokensMap;
  lastUpdateTimestamp: LastUpdateTimestamp;
};

const defaultTokenMaps: TokenMaps = {
  userTokens: {},
  lastUpdateTimestamp: {},
};

export const tokens = createModel<RootModel>()({
  name: "tokens",
  state: defaultTokenMaps,
  reducers: {
    updateAddressTokens(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        tokens: TokenV2[];
      },
    ) {
      const { uniqueId, address, tokens: addressTokens } = payload;
      const allChainTokens = state.userTokens;
      const oldUniqueIdUserTokens = allChainTokens[uniqueId] ?? {};
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...oldUniqueIdUserTokens,
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
      const { uniqueId, address, token: paramToken } = payload;
      const token = { ...paramToken, ownerAddress: address };

      const allChainTokens = state.userTokens;
      const oldUniqueIdUserTokens = allChainTokens[uniqueId] ?? {};
      const oldAddressTokens = oldUniqueIdUserTokens[address] ?? [];

      const exist = oldAddressTokens.some((item: TokenV2) => {
        return (
          item.contractAddress.toLowerCase() ===
          token.contractAddress.toLowerCase()
        );
      });
      if (exist) {
        return state;
      }
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...oldUniqueIdUserTokens,
            [address]: [...oldAddressTokens, { ...token }],
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
      const oldUniqueIdUserTokens = allChainTokens[uniqueId] ?? {};
      const oldAddressTokens = oldUniqueIdUserTokens[address] ?? [];
      const newTokens = oldAddressTokens.filter((item: TokenV2) => {
        return (
          item.contractAddress.toLowerCase() !==
          token.contractAddress.toLowerCase()
        );
      });
      return {
        ...state,
        userTokens: {
          ...allChainTokens,
          [uniqueId]: {
            ...oldUniqueIdUserTokens,
            [address]: newTokens,
          },
        },
      };
    },

    updateTimestamp(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        newUpdateTimestamp: number;
      },
    ) {
      const { uniqueId, address, newUpdateTimestamp } = payload;
      const { lastUpdateTimestamp } = state;
      const oldAddressUpdateTimestamp = lastUpdateTimestamp?.[uniqueId] ?? {};

      return {
        ...state,
        lastUpdateTimestamp: {
          ...lastUpdateTimestamp,
          [uniqueId]: {
            ...oldAddressUpdateTimestamp,
            [address]: newUpdateTimestamp,
          },
        },
      };
    },
  },
  effects: (dispatch) => ({}),
});
