import { CoinCurve } from "../../../types/CoinCurve";
import { type CoinDerivation } from "../../../types/CoinDerivation";

export const ETH_DERIVATION: CoinDerivation = {
  path: ["m/44'/60'/0'/0"],
  curve: CoinCurve.SECP256K1,
};
