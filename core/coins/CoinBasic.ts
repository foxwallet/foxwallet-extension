import {
  type AccountOption,
  type ExportPrivateKeyTypeMap,
  type ImportPrivateKeyTypeMap,
} from "../types/CoinBasic";
import { type CoinType } from "core/types";

export abstract class CoinBasic<T extends CoinType> {
  constructor(public coinType: CoinType) {}

  public abstract exportPrivateKey(
    privateKey: string,
    exportType: ExportPrivateKeyTypeMap[T],
    address?: string,
  ): string;

  public abstract isValidPrivateKey(
    rawPrivateKey: string,
    pkType: ImportPrivateKeyTypeMap[T],
  ): boolean;

  public abstract deriveAccount(
    privateKey: string,
    pkType: ImportPrivateKeyTypeMap[T],
  ): { address: string; publicKey: string; viewKey?: string };
}
