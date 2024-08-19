import { CoinCurve } from "../../../types/CoinCurve";
import { CoinDerivation } from "../../../types/CoinDerivation";
import { AleoAccountOption } from "../types/AleoAccount";

export const ALEO_DERIVATION: CoinDerivation = {
  path: ["m/44'/0'"],
  curve: CoinCurve.BLS12377,
};

export const DEFAULT_ALEO_ACCOUNT_OPTION: AleoAccountOption = {};
