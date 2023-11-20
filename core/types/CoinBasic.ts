import {
  type AleoAccountOption,
  type AleoExportPKType,
  type AleoImportPKType,
} from "../coins/ALEO/types/AleoAccount";
import {
  EthAccountOption,
  EthExportPKType,
  EthImportPKType,
} from "../coins/ETH/types/EthAccount";
import { type CoinType } from "./CoinType";

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
