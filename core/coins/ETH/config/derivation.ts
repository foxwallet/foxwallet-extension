import { CoinCurve } from "../../../types/CoinCurve";
import { type CoinDerivation } from "../../../types/CoinDerivation";
import { type ETHAccountOption } from "../types/ETHAccount";

export const ETH_DERIVATION: CoinDerivation = {
  path: ["m/44'/60'/0'/0"],
  curve: CoinCurve.SECP256K1,
};

export const DEFAULT_ETH_ACCOUNT_OPTION: ETHAccountOption = {};
