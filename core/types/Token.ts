import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type Currency } from "core/types/Currency";

export enum TokenSecurity {
  WHITE = "WHITELIST",
  BLACK = "BLACKLIST",
}

export interface BaseToken {
  symbol: string;
  decimals: number;
  name?: string;
}

export interface NativeToken extends Currency {
  // in case of the native token have an address
  address?: string;
  logo?: string;
  coingeckoCoinId?: string;
}

export interface NativeTokenWithAddress extends Currency {
  address: string;
  logo?: string;
}

export enum AssetType {
  COIN = "COIN",
  TOKEN = "TOKEN",
}

export type TokenMetaV2 = Currency & {
  type: AssetType;
  subType?: string;
  contractAddress: string;
  display?: string;
  icon?: string;
  security?: TokenSecurity;
  uniqueId: ChainUniqueId;
};

export type TokenMarket = TokenMetaV2 & {
  price?: number;
  change?: string;
};

export type AddressBalance = {
  total?: bigint;
  privateBalance?: bigint;
  publicBalance?: bigint;
  availableBalance?: bigint;
  ownerAddress: string;
};

export type TokenV2 = TokenMetaV2 & TokenMarket & AddressBalance;
