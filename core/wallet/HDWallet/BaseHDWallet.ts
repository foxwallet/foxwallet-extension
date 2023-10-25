import { getCoinDerivation } from "../../helper/CoinBasic";
import { AccountOption } from "../../types/CoinBasic";
import { CoinCurve } from "../../types/CoinCurve";
import { CoinType } from "../../types/CoinType";
import {
  EncryptedKeyPair,
  HDWalletProps,
  RawKeyPair,
} from "../../types/KeyPair";
import { HDKey } from "../HDKey";
import { BLS12377HDWallet } from "./BLS12377HDWallet";
// import { Secp256k1HDWallet } from "./Secp256k1HDWallet";

export interface BaseHDWallet<T extends CoinType> {
  derive(
    index: number,
    accountId: string,
    token: string,
    option?: AccountOption[T]
  ): Promise<EncryptedKeyPair>;
}

export function getHDWallet<T extends CoinType>(
  hdWallet: HDKey[T],
  config: HDWalletProps<T>
): BaseHDWallet<T> {
  const { symbol } = config;
  const coinCurve = getCoinDerivation(symbol).curve;
  switch (coinCurve) {
    // case CoinCurve.SECP256K1: {
    //   return new Secp256k1HDWallet(symbol, hdWallet);
    // }
    case CoinCurve.BLS12377: {
      return new BLS12377HDWallet(symbol, hdWallet);
    }
  }
}

// export abstract class BaseHDWallet<T extends CoinType> {
//   constructor(
//     protected symbol: T,
//     protected wallet: HDKey[T]
//   ) {
//     this.symbol = symbol;
//   }

//   public static init<T extends CoinType>(
//     hdWallet: HDKey[T],
//     config: HDWalletProps<T>
//   ) {
//     const { symbol } = config;
//     const coinCurve = getCoinDerivation(symbol).curve;
//     switch (coinCurve) {
//       // case CoinCurve.SECP256K1: {
//       //   return new Secp256k1HDWallet(symbol, hdWallet);
//       // }
//       case CoinCurve.BLS12377: {
//         return new BLS12377HDWallet(symbol, hdWallet);
//       }
//     }
//   }

//   public abstract derive(
//     index: number,
//     accountId: string,
//     token: string,
//     option?: AccountOption[T]
//   ): Promise<EncryptedKeyPair>;

//   public getSymbol(): CoinType {
//     return this.symbol;
//   }
// }
