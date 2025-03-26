import { providers } from "ethers";
import { type Block } from "@ethersproject/abstract-provider";

// https://github.com/ethers-io/ethers.js/issues/2107
export class Formatter extends providers.Formatter {
  _block(value: any, format: any): Block {
    if (!value.gasLimit) {
      value.gasLimit = "0x0";
    }
    return super._block(value, format);
  }
}

let defaultFormatter: null | Formatter = null;

export class CustomJsonRpcProvider extends providers.JsonRpcProvider {
  static getFormatter(): Formatter {
    if (defaultFormatter == null) {
      defaultFormatter = new Formatter();
    }

    return defaultFormatter;
  }
}
