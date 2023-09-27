import { PrivateKey } from "wasm";
import { encode as bs58Encode, decode as bs58Decode } from "bs58";
import { CoinBasic } from "../../CoinBasic";
import { CoinType } from "../../../types/CoinType";
import { ALEO_PRIVATE_PREFIX } from "../constants";
import {
  AleoAccountOption,
  AleoExportPKType,
  AleoImportPKType,
} from "../types/AleoAccount";
import { CoreError, CoreErrorCode } from "../../../types/Error";

class AleoBasic extends CoinBasic<CoinType.ALEO> {
  public serializeBuffer(keyBuffer: Buffer): string {
    return `${ALEO_PRIVATE_PREFIX}${bs58Encode(keyBuffer)}`;
  }

  public deserializePrivateKeyStr(
    privateKeyType: AleoImportPKType,
    keyStr: string
  ): {
    privateKey: Buffer;
  } {
    switch (privateKeyType) {
      case AleoImportPKType.ALEO_PK: {
        if (!keyStr.startsWith(ALEO_PRIVATE_PREFIX)) {
          throw new CoreError(CoreErrorCode.INVALID_PRIVATE_KEY);
        }
        keyStr = keyStr.slice(ALEO_PRIVATE_PREFIX.length);

        const data = bs58Decode(keyStr);
        return {
          privateKey: Buffer.from(data),
        };
      }
    }
  }

  public deriveAleoViewKey(
    privateKey: Buffer,
    option: AleoAccountOption
  ): {
    viewKey: string;
    address: string;
  } {
    const pk = PrivateKey.from_string(
      `${ALEO_PRIVATE_PREFIX}${bs58Encode(privateKey)}`
    );

    const viewKey = pk.to_view_key().to_string();
    const address = pk.to_address().to_string();
    return {
      viewKey,
      address,
    };
  }

  public exportPrivateKey(privateKey: string, exportType: AleoExportPKType) {
    switch (exportType) {
      case AleoExportPKType.ALEO_PK: {
        return privateKey;
      }
    }
  }

  public getPrivateKeyForSign(privateKey: string) {
    return privateKey;
  }
}

export const aleoBasic = new AleoBasic(CoinType.ALEO);
