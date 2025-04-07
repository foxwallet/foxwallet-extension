import { CoinType } from "../../types/CoinType";
import { type BLS12377HDKey } from "../HDKey/BLS12377HDKey";
import { type BaseHDWallet } from "./BaseHDWallet";
import { type AccountOption } from "../../types/CoinBasic";
import { type HDKey } from "../HDKey";
import {
  type EncryptedKeyPairWithViewKey,
  RawKeyPair,
  RawKeyPairWithViewKey,
} from "../../types/KeyPair";
import { getCoinDerivation } from "../../helper/CoinBasic";
import { CoreError } from "../../types/Error";
import { encryptStr } from "../../utils/encrypt";
import init, { PrivateKey } from "aleo_wasm_mainnet";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";

export class BLS12377HDWallet<T extends CoinType> implements BaseHDWallet<T> {
  private readonly coinRootPath: string;
  private readonly coinRoot: BLS12377HDKey;
  private readonly symbol: T;

  constructor(symbol: T, hdWallet: BLS12377HDKey) {
    this.symbol = symbol;
    this.coinRootPath = getCoinDerivation(symbol).path[0];
    this.coinRoot = hdWallet.derive(this.coinRootPath);
  }

  public async derive(
    i: number,
    accountId: string,
    token: string,
    _option?: AccountOption[T],
  ): Promise<EncryptedKeyPairWithViewKey> {
    switch (this.symbol) {
      case CoinType.ALEO: {
        try {
          await init();
          const wallet = this.coinRoot.deriveChild(i);
          const pk = PrivateKey.from_seed_unchecked(wallet.key);

          const viewKey = pk.to_view_key().to_string();
          const address = pk.to_address().to_string();
          const encryptedPrivateKey = await encryptStr(token, pk.to_string());

          if (!encryptedPrivateKey) {
            throw new Error("Encrypt private key failed");
          }
          return {
            accountId,
            privateKey: encryptedPrivateKey,
            viewKey,
            address,
            index: i,
            coinType: CoinType.ALEO,
            option: DEFAULT_ALEO_ACCOUNT_OPTION,
          };
        } catch (err) {
          console.error(err);
          // @ts-expect-error throw error
          throw new CoreError("BLS12377HDWallet derive failed " + err.message);
        }
      }
      default: {
        throw new Error("Unsupport type: " + this.symbol);
      }
    }
  }
}
