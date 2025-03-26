import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import { groupBy, isEqual } from "lodash";
import { type TokenV2 } from "core/types/Token";
import { type ChainUniqueId } from "core/types/ChainUniqueId";

export type BalanceItem = {
  total: bigint;
  // aleo 的 private 余额
  privateBalance?: bigint;
  publicBalance?: bigint;
  availableBalance?: bigint;
};

export type BatchBalanceItem = {
  asset: TokenV2;
  address: string;
  balanceItem: BalanceItem;
};

export type AddressBalanceMap = {
  [address: string]: BalanceItem | undefined;
};

export type CoinsItem = {
  [contractAddress: string]: AddressBalanceMap | undefined;
};

export type ChainItems = {
  baseCurrency: AddressBalanceMap | undefined;
  tokens: CoinsItem | undefined;
};

export type ChainBalanceModel = {
  [uniqueId in ChainUniqueId]?: ChainItems | undefined;
};

export const coinBalanceV2 = createModel<RootModel>()({
  name: "coinBalanceV2",
  state: {} as ChainBalanceModel,
  reducers: {
    updateCoinBalance(
      state,
      payload: {
        uniqueId: ChainUniqueId;
        address: string;
        contractAddress?: string;
        balanceItem: BalanceItem;
      },
    ) {
      const { uniqueId, contractAddress, balanceItem, address } = payload;
      if (!balanceItem) {
        return state;
      }
      balanceItem.total = balanceItem.total ?? "0";
      balanceItem.availableBalance = balanceItem.availableBalance ?? 0n;
      balanceItem.privateBalance = balanceItem.privateBalance ?? 0n;
      balanceItem.publicBalance = balanceItem.publicBalance ?? 0n;
      const chainState: ChainItems = state[uniqueId] ?? {
        baseCurrency: undefined,
        tokens: {},
      };
      let newBaseCurrency = chainState.baseCurrency ?? {};
      let newTokens = chainState.tokens ?? {};
      if (contractAddress) {
        const lowerTokenAddr = contractAddress.toLowerCase();
        const oldAddressBalanceMap = newTokens[lowerTokenAddr];
        const oldAddressBalanceItem = oldAddressBalanceMap?.[address];
        if (isEqual(oldAddressBalanceItem, balanceItem)) {
          return state;
        }
        newTokens = {
          ...newTokens,
          [lowerTokenAddr]: {
            ...oldAddressBalanceMap,
            [address]: {
              ...balanceItem,
            },
          },
        };
      } else {
        const oldAddressBaseCurrency = newBaseCurrency[address];
        if (isEqual(oldAddressBaseCurrency, balanceItem)) {
          return state;
        }
        newBaseCurrency = {
          ...newBaseCurrency,
          [address]: {
            ...balanceItem,
          },
        };
      }
      return {
        ...state,
        [uniqueId]: {
          ...chainState,
          baseCurrency: newBaseCurrency,
          tokens: newTokens,
        },
      } as ChainBalanceModel;
    },
    batchUpdateBalance(
      state,
      payload: {
        items: BatchBalanceItem[];
      },
    ) {
      try {
        const { items } = payload;
        const newState: ChainBalanceModel = { ...state };
        let changed = false;
        const itemsByUniqueId = groupBy(items, (item) => item.asset.uniqueId);
        Object.keys(itemsByUniqueId).forEach((uniqueIdStr) => {
          const uniqueId = uniqueIdStr as ChainUniqueId;
          const chainState: ChainItems = {
            baseCurrency: undefined,
            tokens: {},
            ...newState[uniqueId],
          };
          const itemsWithSameUniqueId = itemsByUniqueId[uniqueId];
          const itemsByContractAddress = groupBy(
            itemsWithSameUniqueId,
            (item) => item.asset.contractAddress,
          );
          Object.keys(itemsByContractAddress).forEach((contractAddress) => {
            if (contractAddress === "undefined" || !contractAddress) {
              const chainBaseCurrency = { ...chainState.baseCurrency };
              const baseCurrencyItems = itemsByContractAddress[contractAddress];
              for (const baseCurrencyItem of baseCurrencyItems) {
                const { address, balanceItem } = baseCurrencyItem;
                const oldAddressBaseCurrency = chainBaseCurrency[address];
                if (isEqual(oldAddressBaseCurrency, balanceItem)) {
                  continue;
                }
                changed = true;
                chainBaseCurrency[address] = balanceItem;
              }
              chainState.baseCurrency = chainBaseCurrency;
            } else {
              const lowerTokenAddr = contractAddress.toLowerCase();
              const chainTokens = chainState.tokens?.[lowerTokenAddr] ?? {};
              const sameContractItems =
                itemsByContractAddress[contractAddress] ?? [];
              for (const sameContractItem of sameContractItems) {
                const { address, balanceItem } = sameContractItem;
                const oldAddressBalance = chainTokens[address];
                if (isEqual(oldAddressBalance, balanceItem)) {
                  continue;
                }
                changed = true;
                chainTokens[address] = balanceItem;
              }
              chainState.tokens = {
                ...chainState.tokens,
                [lowerTokenAddr]: { ...chainTokens },
              };
            }
          });
          newState[uniqueId] = chainState;
        });
        console.log("===> batchUpdateBalance change status ", changed);
        if (!changed) {
          return state;
        }
        return newState;
      } catch (err) {
        console.log("===> batchUpdateBalance error ", err);
        return state;
      }
    },
  },
});
