import { Wallet } from "ethers";
import { CoinType } from "../../../types/CoinType";
import { CoreError, CoreErrorCode } from "../../../types/Error";
import { CoinBasic } from "../../CoinBasic";
import {
  EthAccountOption,
  EthExportPKType,
  EthImportPKType,
} from "../types/EthAccount";
import { isValidPrivateKey, stripHexPrefix } from "../utils/account";
import * as ethUtil from "ethereumjs-util";

class EthBasic extends CoinBasic<CoinType.ETH> {
  public serializeBuffer(keyBuffer: Buffer): string {
    return keyBuffer.toString("hex");
  }

  public deserializePrivateKeyStr(
    privateKeyType: EthImportPKType,
    keyStr: string
  ): { privateKey: Buffer } {
    switch (privateKeyType) {
      case EthImportPKType.ETH_HEX: {
        const privateKey = Buffer.from(stripHexPrefix(keyStr), "hex");
        const isPrivateKey = isValidPrivateKey(privateKey);
        if (!isPrivateKey) {
          throw new CoreError(CoreErrorCode.INVALID_PRIVATE_KEY);
        }
        return {
          privateKey,
        };
      }
    }
  }

  public deriveAddress(
    privateKey: Buffer,
    _option: EthAccountOption
  ): {
    publicKey: string;
    address: string;
  } {
    const publicKey = ethUtil.privateToPublic(privateKey);
    let address = ethUtil.publicToAddress(publicKey).toString("hex");
    address = ethUtil.addHexPrefix(address);
    return {
      publicKey: publicKey.toString("hex"),
      address: ethUtil.toChecksumAddress(address),
    };
  }

  public exportPrivateKey(privateKey: string, exportType: EthExportPKType) {
    switch (exportType) {
      case EthExportPKType.HEX: {
        return privateKey;
      }
    }
  }
}

export const ethBasic = new EthBasic(CoinType.ETH);
