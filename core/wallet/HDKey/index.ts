import { type CoinType } from "../../types/CoinType";
import { type BLS12377HDKey } from "./BLS12377HDKey";
import { EthHDKey } from "./EthHDKey";

export interface HDKey {
  // [CoinType.ETH]: EthHDKey,
  [CoinType.ALEO]: BLS12377HDKey;
}
