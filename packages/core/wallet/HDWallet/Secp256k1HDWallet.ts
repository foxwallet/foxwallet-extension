
import { CoinType } from "../../types/CoinType";
import { EthHDKey } from "../HDKey/EthHDKey";
import { BaseHDWallet } from "./BaseHDWallet";
import { AccountOption } from "../../types/CoinBasic";
import { HDKey } from "../HDKey";
import { EncryptedKeyPairWithPublicKey, RawKeyPairWithPublicKey } from "../../types/KeyPair";
import { getCoinDerivation } from "../../helper/CoinBasic";
import { CoreError } from "../../types/Error";
import { coinBasicFactory } from "../../coins/CoinBasicFactory";
import { encryptStr } from "../../utils/encrypt";

// export class Secp256k1HDWallet<T extends CoinType> extends BaseHDWallet<T> {
//   private coinRootPath: string;
//   private coinRoot: EthHDKey;

//   constructor(
//     symbol: T,
//     hdWallet: HDKey[T]
//   ) {
//     super(symbol, hdWallet);
//     this.coinRootPath = getCoinDerivation(symbol).path[0];
//     this.coinRoot = hdWallet.derive(this.coinRootPath) as EthHDKey;
//   }

//   public async derive(
//     index: number,
//     accountId: string,
//     token: string,
//     option?: AccountOption[T]
//   ): Promise<EncryptedKeyPairWithPublicKey> {
//     if (!accountId) {
//       throw new Error("Wrong arguments when call Secp256k1HDWallet addAccounts");
//     }
//     const child = this.coinRoot.deriveChild(index);
//     const privateKey = child.privateKey;
//     if (!privateKey) {
//       throw new CoreError("Secp256k1HDWallet derive failed ");
//     }
//     const privateKeyBuffer = Buffer.from(privateKey);
//     const { publicKey, address } = coinBasicFactory(this.symbol).deriveAddress(
//       privateKeyBuffer,
//       option
//     );
//     const encryptedPrivateKey = await encryptStr(token, privateKeyBuffer.toString("hex"));
//     if (!encryptedPrivateKey) {
//       throw new Error("Encrypt private key failed");
//     }
//     return {
//       accountId,
//       privateKey:  encryptedPrivateKey,
//       publicKey,
//       address,
//       index,
//     };
//   }
// }