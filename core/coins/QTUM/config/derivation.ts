import { CoinCurve } from "core/types/CoinCurve";
import type { CoinDerivation } from "core/types/CoinDerivation";

export const QTUM_DERIVATION: CoinDerivation = {
  path: ["m/44'/2301'/0'/0"], // P2PKH default
  curve: CoinCurve.SECP256K1,
};

export const QTUM_DERIVATION_PATHS = {
  p2pkh: "m/44'/2301'/0'/0",
  p2sh_p2wpkh: "m/49'/2301'/0'/0",
  p2wpkh: "m/84'/2301'/0'/0",
  p2tr: "m/86'/2301'/0'/0",
};
