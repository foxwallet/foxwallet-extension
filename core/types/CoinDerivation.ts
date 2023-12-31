import { type CoinCurve } from "./CoinCurve";

export interface CoinDerivation {
  path: string[];
  curve: CoinCurve;
}
