import { ALEO_DERIVATION } from "../coins/ALEO/config/derivation";
import { ETH_DERIVATION } from "../coins/ETH/config/derivation";
import { CoinDerivation } from "../types/CoinDerivation";
import { CoinType } from "../types/CoinType";

export const getCoinDerivation = (coinType: CoinType): CoinDerivation => {
  switch (coinType) {
    case CoinType.ETH: {
      return ETH_DERIVATION;
    }
    case CoinType.ALEO: {
      return ALEO_DERIVATION;
    }
  }
};
