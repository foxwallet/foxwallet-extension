import init, { PrivateKey, Address } from "aleo_wasm";
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
import { logger } from "@/common/utils/logger";

class AleoBasic extends CoinBasic<CoinType.ALEO> {
  constructor() {
    super(CoinType.ALEO);
    init();
  }

  public isValidAddress(address: string): boolean {
    try {
      const addressObj = Address.from_string(address);
      console.log("===> addressObj: ", addressObj, !!addressObj);
      return !!addressObj;
    } catch (err) {
      logger.log("===> isValidAddress failed: ", err, address);
      return false;
    }
  }

  public isValidPrivateKey(
    privateKey: string,
    pkType: AleoImportPKType,
  ): boolean {
    try {
      const pkObj = PrivateKey.from_string(privateKey);
      return !!pkObj;
    } catch (err) {
      logger.log("===> isValidPrivateKey failed: ", err);
      return false;
    }
  }

  public serializeBuffer(keyBuffer: Buffer): string {
    return `${ALEO_PRIVATE_PREFIX}${bs58Encode(keyBuffer)}`;
  }

  public deserializePrivateKeyStr(
    privateKeyType: AleoImportPKType,
    keyStr: string,
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

  public deriveAccount(
    privateKey: string,
    pkType: AleoImportPKType,
  ): {
    viewKey: string;
    address: string;
    publicKey: string;
  } {
    const pk = PrivateKey.from_string(privateKey);

    const viewKey = pk.to_view_key().to_string();
    const address = pk.to_address().to_string();
    return {
      viewKey,
      address,
      publicKey: "",
    };
  }

  public exportPrivateKey(privateKey: string, exportType: AleoExportPKType) {
    switch (exportType) {
      case AleoExportPKType.ALEO_PK: {
        return privateKey;
      }
    }
  }
}

export const aleoBasic = new AleoBasic();
