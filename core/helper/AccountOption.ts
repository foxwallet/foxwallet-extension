import { CoinType } from "core/types";
import { type ETHAccountOption } from "core/coins/ETH/types/ETHAccount";
import { type AleoAccountOption } from "core/coins/ALEO/types/AleoAccount";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { DEFAULT_ACCOUNT_OPTION_V2 } from "core/types/CoinBasic";

export const INNER_COINTYPE: CoinType[] = [CoinType.ETH, CoinType.ALEO];

export type AccountOption = {
  [CoinType.ETH]: ETHAccountOption;
  [CoinType.ALEO]: AleoAccountOption;
};

export const DEFAULT_ACCOUNT_OPTION: {
  [key in CoinType]: AccountOption[key];
} = {
  [CoinType.ETH]: DEFAULT_ETH_ACCOUNT_OPTION,
  [CoinType.ALEO]: DEFAULT_ALEO_ACCOUNT_OPTION,
};

export const DEFAULT_INIT_CONFIG = INNER_COINTYPE.map((coinType) => ({
  coinType,
  option: DEFAULT_ACCOUNT_OPTION_V2[coinType],
}));
