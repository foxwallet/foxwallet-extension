import { CoinType } from "../../types/CoinType";
import { type Secp256k1HDKeyType } from "../HDKey/Secp256k1HDKey";
import { type BaseHDWallet } from "./BaseHDWallet";
import {
  type AccountOption,
  type ImportPrivateKeyTypeMap,
} from "../../types/CoinBasic";
import { type EncryptedKeyPairWithPublicKey } from "../../types/KeyPair";
import { getCoinDerivation } from "../../helper/CoinBasic";
import { CoreError } from "../../types/Error";
import { coinBasicFactory } from "../../coins/CoinBasicFactory";
import { encryptStr } from "../../utils/encrypt";
import { ETHImportPKType } from "../../coins/ETH/types/ETHAccount";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";

export class Secp256k1HDWallet<T extends CoinType> implements BaseHDWallet<T> {
  private readonly coinRootPath: string;
  private readonly coinRoot: Secp256k1HDKeyType;
  private readonly symbol: T;

  constructor(symbol: T, hdWallet: Secp256k1HDKeyType) {
    this.symbol = symbol;
    this.coinRootPath = getCoinDerivation(symbol).path[0];
    this.coinRoot = hdWallet.derivePath(this.coinRootPath);
  }

  public async derive(
    index: number,
    accountId: string,
    token: string,
    option?: AccountOption[T],
  ): Promise<EncryptedKeyPairWithPublicKey> {
    if (!accountId) {
      throw new Error(
        "Wrong arguments when call Secp256k1HDWallet addAccounts",
      );
    }
    const child = this.coinRoot.deriveChild(index);
    const privateKey = child.getWallet().getPrivateKey();
    if (!privateKey) {
      throw new CoreError("Secp256k1HDWallet derive failed ");
    }
    const privateKeyBuffer = Buffer.from(privateKey);
    const { publicKey, address } = coinBasicFactory(this.symbol).deriveAccount(
      child.getWallet().getPrivateKeyString(),
      ETHImportPKType.ETH_HEX as ImportPrivateKeyTypeMap[T],
    );
    const encryptedPrivateKey = await encryptStr(
      token,
      privateKeyBuffer.toString("hex"),
    );
    if (!encryptedPrivateKey) {
      throw new Error("Encrypt private key failed");
    }
    return {
      coinType: CoinType.ETH,
      accountId,
      privateKey: encryptedPrivateKey,
      publicKey,
      address,
      index,
      option: option ?? DEFAULT_ETH_ACCOUNT_OPTION,
    };
  }
}
