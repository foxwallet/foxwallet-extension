import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";
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

export interface ImportPrivateKeyTypeMap {
  [CoinType.ETH]: ETHImportPKType;
  [CoinType.ALEO]: AleoImportPKType;
}

export interface ExportPrivateKeyTypeMap {
  [CoinType.ETH]: ETHExportPKType;
  [CoinType.ALEO]: AleoExportPKType;
}

export interface AccountOption {
  [CoinType.ETH]: ETHAccountOption;
  [CoinType.ALEO]: AleoAccountOption;
}

export const DEFAULT_ACCOUNT_OPTION_V2: {
  [key in CoinType]: AccountOption[key];
} = {
  [CoinType.ALEO]: DEFAULT_ALEO_ACCOUNT_OPTION,
  [CoinType.ETH]: DEFAULT_ETH_ACCOUNT_OPTION,
};
