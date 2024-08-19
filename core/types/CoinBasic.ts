import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import {
  type AleoAccountOption,
  type AleoExportPKType,
  type AleoImportPKType,
} from "../coins/ALEO/types/AleoAccount";
import { CoinType } from "./CoinType";

export interface ImportPrivateKeyTypeMap {
  // [CoinType.ETH]: EthImportPKType;
  [CoinType.ALEO]: AleoImportPKType;
}

export interface ExportPrivateKeyTypeMap {
  // [CoinType.ETH]: EthExportPKType;
  [CoinType.ALEO]: AleoExportPKType;
}

export interface AccountOption {
  // [CoinType.ETH]: EthAccountOption,
  [CoinType.ALEO]: AleoAccountOption;
}

export const DEFAULT_ACCOUNT_OPTION_V2: {
  [key in CoinType]: AccountOption[key];
} = {
  [CoinType.ALEO]: DEFAULT_ALEO_ACCOUNT_OPTION,
};
