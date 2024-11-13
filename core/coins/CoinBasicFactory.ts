import { CoinType } from "../types/CoinType";
import { aleoBasic } from "./ALEO/account";
import { ethBasic } from "./ETH/account";
import { type CoinBasic } from "./CoinBasic";

export function coinBasicFactory<T extends CoinType>(
  coinType: T,
): CoinBasic<T> {
  switch (coinType) {
    case CoinType.ETH:
      return ethBasic as CoinBasic<T>;
    case CoinType.ALEO:
      return aleoBasic as CoinBasic<T>;
    default:
      throw new Error("Invalid coin type");
  }
}
