import { CoinType } from "core/types";
import { type ETHAccountOption } from "core/coins/ETH/types/ETHAccount";
import { type AleoAccountOption } from "core/coins/ALEO/types/AleoAccount";
import { type QTUMAccountOption } from "core/coins/QTUM/types/QTUMAccount";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import {
  DEFAULT_QTUM_ACCOUNT_OPTION,
  QTUM_TESTNET_ACCOUNT_OPTION,
} from "core/coins/QTUM/types/QTUMAccount";
import {
  type AccountOption,
  DEFAULT_ACCOUNT_OPTION_V2,
} from "core/types/CoinBasic";

export const INNER_COINTYPE: CoinType[] = [CoinType.ETH, CoinType.ALEO, CoinType.QTUM];

export const DEFAULT_ACCOUNT_OPTION: {
  [key in CoinType]: AccountOption[key];
} = {
  [CoinType.ETH]: DEFAULT_ETH_ACCOUNT_OPTION,
  [CoinType.ALEO]: DEFAULT_ALEO_ACCOUNT_OPTION,
  [CoinType.QTUM]: DEFAULT_QTUM_ACCOUNT_OPTION,
};

/**
 * All account options that should be derived for each CoinType.
 * Most CoinTypes have a single option; QTUM has mainnet + testnet
 * because they use different address derivation parameters.
 */
export const ALL_ACCOUNT_OPTIONS: Array<{
  coinType: CoinType;
  option: AccountOption[CoinType];
}> = [
  { coinType: CoinType.ETH, option: DEFAULT_ETH_ACCOUNT_OPTION },
  { coinType: CoinType.ALEO, option: DEFAULT_ALEO_ACCOUNT_OPTION },
  { coinType: CoinType.QTUM, option: DEFAULT_QTUM_ACCOUNT_OPTION },
  { coinType: CoinType.QTUM, option: QTUM_TESTNET_ACCOUNT_OPTION },
];

export const DEFAULT_INIT_CONFIG = INNER_COINTYPE.map((coinType) => ({
  coinType,
  option: DEFAULT_ACCOUNT_OPTION_V2[coinType],
}));
