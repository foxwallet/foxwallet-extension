import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";
import { DEFAULT_QTUM_ACCOUNT_OPTION } from "core/coins/QTUM/types/QTUMAccount";
import {
  type AleoAccountOption,
  type AleoExportPKType,
  type AleoImportPKType,
} from "../coins/ALEO/types/AleoAccount";
import { CoinType } from "./CoinType";
import {
  type ETHAccountOption,
  type ETHExportPKType,
  type ETHImportPKType,
} from "../coins/ETH/types/ETHAccount";
import {
  type QTUMAccountOption,
  type QTUMExportPKType,
  type QTUMImportPKType,
} from "../coins/QTUM/types/QTUMAccount";

export interface ImportPrivateKeyTypeMap {
  [CoinType.ETH]: ETHImportPKType;
  [CoinType.ALEO]: AleoImportPKType;
  [CoinType.QTUM]: QTUMImportPKType;
}

export interface ExportPrivateKeyTypeMap {
  [CoinType.ETH]: ETHExportPKType;
  [CoinType.ALEO]: AleoExportPKType;
  [CoinType.QTUM]: QTUMExportPKType;
}

export interface AccountOption {
  [CoinType.ETH]: ETHAccountOption;
  [CoinType.ALEO]: AleoAccountOption;
  [CoinType.QTUM]: QTUMAccountOption;
}

export const DEFAULT_ACCOUNT_OPTION_V2: {
  [key in CoinType]: AccountOption[key];
} = {
  [CoinType.ALEO]: DEFAULT_ALEO_ACCOUNT_OPTION,
  [CoinType.ETH]: DEFAULT_ETH_ACCOUNT_OPTION,
  [CoinType.QTUM]: DEFAULT_QTUM_ACCOUNT_OPTION,
};
