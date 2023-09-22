
import { CoinType } from "../../types/CoinType";
import { BLS12377HDKey } from "../HDKey/BLS12377HDKey";
import { BaseHDWallet } from "./BaseHDWallet";
import { AccountOption } from "../../types/CoinBasic";
import { HDKey } from "../HDKey";
import { EncryptedKeyPairWithViewKey, RawKeyPair, RawKeyPairWithViewKey } from "../../types/KeyPair";
import { getCoinDerivation } from "../../helper/CoinBasic";
import { CoreError } from "../../types/Error";
import { encryptStr } from "../../utils/encrypt";
import { logger } from "ethers";
import { PrivateKey } from "wasm";

export class BLS12377HDWallet<T extends CoinType> implements BaseHDWallet<T> {
  private coinRootPath: string;
  private coinRoot: BLS12377HDKey;
  private symbol: T;

  constructor(
    symbol: T,
    hdWallet: HDKey[T]
  ) {
    this.symbol = symbol;
    this.coinRootPath = getCoinDerivation(symbol).path[0];
    this.coinRoot = hdWallet.derive(this.coinRootPath) as BLS12377HDKey;
  }

  public async derive(
    i: number,
    accountId: string,
    token: string,
    _option?: AccountOption[T]
  ): Promise<EncryptedKeyPairWithViewKey> {
    switch (this.symbol) {
      case CoinType.ALEO: {
        try {
          const wallet = this.coinRoot.deriveChild(i);
          const pk = PrivateKey.from_seed_unchecked(wallet.key);
          console.log("===> wallet: ", pk);

          const viewKey = pk.to_view_key().to_string();
          const address  = pk.to_address().to_string();
          const encryptedPrivateKey = await encryptStr(token, pk.to_string());

          if (!encryptedPrivateKey) {
            throw new Error("Encrypt private key failed");
          }
          const encryptedViewKey = await encryptStr(token, viewKey);
          if (!encryptedViewKey) {
            throw new Error("Encrypt view key failed");
          }
          return {
            accountId,
            privateKey: encryptedPrivateKey,
            viewKey: encryptedViewKey,
            address: address,
            index: i,
          };
        } catch (err) {
          throw new CoreError("BLS12377HDWallet derive failed " + err);
        }
      }
      default: {
        throw new Error("Unsupport type: " + this.symbol);
      }
    }
  }
}