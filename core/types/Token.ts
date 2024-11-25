import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type AssetType } from "@/common/types/asset";
import { type BigNumber } from "ethers";

export interface Currency {
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

export enum TokenSecurity {
  WHITE = "WHITELIST",
  BLACK = "BLACKLIST",
}

export type TokenMetaV2 = Currency & {
  type: AssetType;
  subType?: string;
  contractAddress: string;
  display?: string;
  icon?: string;
  iconSource?: number | string;
  security?: TokenSecurity;
  uniqueId: ChainUniqueId;
};

export type TokenMarket = TokenMetaV2 & {
  price?: number;
  change?: string;
};

export type AddressBalance = {
  balance?: BigNumber;
  privateBalance?: BigNumber;
  publicBalance?: BigNumber;
  availableBalance?: BigNumber;
  ownerAddress: string;
};

export type TokenBalance = TokenMetaV2 & AddressBalance;

export type TokenV2 = TokenBalance & TokenMarket;
