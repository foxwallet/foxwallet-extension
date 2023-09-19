
import { CoinType } from "../../types/CoinType";
import { BLS12377HDKey } from "../HDKey/BLS12377HDKey";
import { BaseHDWallet } from "./BaseHDWallet";
import { AccountOption } from "../../types/CoinBasic";
import { HDKey } from "../HDKey";
import { EncryptedKeyPairWithViewKey, RawKeyPair, RawKeyPairWithViewKey } from "../../types/KeyPair";
import { getCoinDerivation } from "../../helper/CoinBasic";
import { PrivateKey } from "@aleohq/wasm";
import { CoreError } from "../../types/Error";
import { encryptStr } from "../../utils/encrypt";

export class BLS12377HDWallet<T extends CoinType> extends BaseHDWallet<T> {
  private coinRootPath: string;
  private coinRoot: BLS12377HDKey;

  constructor(
    symbol: T,
    hdWallet: HDKey[T]
  ) {
    super(symbol, hdWallet);
    this.coinRootPath = getCoinDerivation(symbol).path[0];
    this.coinRoot = hdWallet.derive(this.coinRootPath) as BLS12377HDKey;
  }

  public async derive(
    i: number,
    accountId: string,
    passwordHash: string,
    _option: AccountOption[T]
  ): Promise<EncryptedKeyPairWithViewKey> {
    switch (this.symbol) {
      case CoinType.ALEO: {
        try {
          const wallet = this.coinRoot.deriveChild(i);
          const pk = PrivateKey.from_seed_unchecked(wallet.key);
          const viewKey = pk.to_view_key().to_string();
          const address  = pk.to_address().to_string();
          const encryptedPrivateKey = await encryptStr(passwordHash, pk.to_string());
          if (!encryptedPrivateKey) {
            throw new Error("Encrypt private key failed");
          }
          const encryptedViewKey = await encryptStr(passwordHash, viewKey);
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