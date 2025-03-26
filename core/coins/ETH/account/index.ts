import { CoinBasic } from "core/coins/CoinBasic";
import { CoinType } from "core/types";
import * as ethUtil from "ethereumjs-util";
import { ETHExportPKType } from "core/coins/ETH/types/ETHAccount";
import { utils as ethersUtils } from "ethers";
export type PubWithAddress = {
  publicKey: string;
  address: string;
};

const pubKeyToAddress = (publicKey: Buffer): PubWithAddress => {
  let address = ethUtil.publicToAddress(publicKey).toString("hex");
  address = ethUtil.addHexPrefix(address);
  return {
    publicKey: publicKey.toString("hex"),
    address: ethUtil.toChecksumAddress(address),
  };
};

class ETHBasic extends CoinBasic<CoinType.ETH> {
  constructor() {
    super(CoinType.ETH);
  }

  public exportPrivateKey(
    privateKey: string,
    exportType: ETHExportPKType,
  ): string {
    switch (exportType) {
      case ETHExportPKType.ETH_HEX: {
        return privateKey;
      }
    }
  }

  public isValidAddress(address: string): boolean {
    return ethersUtils.isAddress(address);
  }

  public isValidPrivateKey(rawPrivateKey: string, pkType: unknown): boolean {
    try {
      const privateKeyBuffer = Buffer.from(
        ethUtil.stripHexPrefix(rawPrivateKey),
        "hex",
      );
      ethUtil.privateToPublic(privateKeyBuffer);
      return true;
    } catch (e) {
      return false;
    }
  }

  public deriveAccount(
    privateKey: string,
    pkType: unknown,
  ): { address: string; publicKey: string } {
    const privateKeyBuffer = Buffer.from(
      ethUtil.stripHexPrefix(privateKey),
      "hex",
    );
    const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);
    const { address, publicKey } = pubKeyToAddress(publicKeyBuffer);
    return {
      address,
      publicKey,
    };
  }
}

export const ethBasic = new ETHBasic();
