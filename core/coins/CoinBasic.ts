import {
  type AccountOption,
  type ExportPrivateKeyTypeMap,
  type ImportPrivateKeyTypeMap,
} from "../types/CoinBasic";
import { type CoinType } from "../types/CoinType";

export abstract class CoinBasic<T extends CoinType> {
  constructor(public coinType: CoinType) {}

  public abstract serializeBuffer(keyBuffer: Buffer): string;

  public abstract deserializePrivateKeyStr(
    privateKeyType: ImportPrivateKeyTypeMap[T],
    keyStr: string,
  ): { privateKey: Buffer; option?: AccountOption[T] };

  public deriveAddress(
    privateKey: Buffer,
    option?: AccountOption[T],
  ): {
    publicKey: string;
    address: string;
  } {
    throw new Error("Not implemented");
  }

  public deriveViewKey(
    _privateKey: Buffer,
    _option?: AccountOption[T],
  ): { address: string; viewKey: string } {
    throw new Error("Not implemented");
  }

  public abstract exportPrivateKey(
    privateKey: string,
    exportType: ExportPrivateKeyTypeMap[T],
    address?: string,
  ): string;

  public getPrivateKeyForSign(privateKey: string): string {
    return privateKey;
  }
}
