import { createModel } from "@rematch/core";
import { type RootModel } from ".";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type Token } from "core/coins/ALEO/types/Token";
import { type TokenV2 } from "core/types/Token";
import { isComplianceProgram } from "core/coins/ALEO/constants";

const getAleoProgramId = (token: TokenV2): string | undefined => {
  if (token.programId) {
    return token.programId;
  }
  if (token.contractAddress) {
    const [programId] = token.contractAddress.split("-");
    return programId || undefined;
  }
  return undefined;
};

const isSameUserToken = (
  uniqueId: ChainUniqueId,
  a: TokenV2,
  b: TokenV2,
): boolean => {
  if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
    const aProgramId = getAleoProgramId(a);
    const bProgramId = getAleoProgramId(b);
    if (
      aProgramId &&
      bProgramId &&
      isComplianceProgram(aProgramId) &&
      aProgramId === bProgramId
    ) {
      return true;
    }
  }
  return (
    a.contractAddress.toLowerCase() === b.contractAddress.toLowerCase()
  );
};

export type TokenMap = {
  [address: string]: TokenV2[] | undefined;
};

export type UserTokensMap = {
  [uniqueId in ChainUniqueId]?: TokenMap;
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
    _reset() {
      return { ...defaultTokenMaps };
    },
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

      const exist = oldAddressTokens.some((item: TokenV2) =>
        isSameUserToken(uniqueId, item, token),
      );
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
      const newTokens = oldAddressTokens.filter(
        (item: TokenV2) => !isSameUserToken(uniqueId, item, token),
      );
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
