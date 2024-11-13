import { type CoinType } from "../../types/CoinType";
import { type BLS12377HDKey } from "./BLS12377HDKey";
import { type Secp256k1HDKeyType } from "./Secp256k1HDKey";

export interface HDKey {
  [CoinType.ETH]: Secp256k1HDKeyType;
  [CoinType.ALEO]: BLS12377HDKey;
}
