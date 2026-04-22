import { CoinBasic } from "core/coins/CoinBasic";
import { CoinType } from "core/types";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { ecc } from "../utils/nobleSecp256k1Adapter";
import {
  QTUMExportPKType,
  QTUMImportPKType,
  DEFAULT_QTUM_ACCOUNT_OPTION,
  type QTUMAccountOption,
} from "../types/QTUMAccount";
import { qtumNetwork, qtumTestnetNetwork } from "../constants";
import { isAddress } from "../utils/address";

const ECPair = ECPairFactory(ecc);

export type PubWithAddress = {
  publicKey: string;
  address: string;
};

class QTUMBasic extends CoinBasic<CoinType.QTUM> {
  constructor() {
    super(CoinType.QTUM);
  }

  public exportPrivateKey(
    privateKey: string,
    exportType: QTUMExportPKType,
    option: QTUMAccountOption = DEFAULT_QTUM_ACCOUNT_OPTION,
  ): string {
    switch (exportType) {
      case QTUMExportPKType.QTUM_WIF: {
        const network =
          option?.network === "testnet" ? qtumTestnetNetwork : qtumNetwork;
        const rawKey = privateKey.startsWith("0x")
          ? privateKey.slice(2)
          : privateKey;

        if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
          const keyPair = ECPair.fromPrivateKey(Buffer.from(rawKey, "hex"), {
            network,
          });
          return keyPair.toWIF();
        }

        try {
          return ECPair.fromWIF(privateKey, network).toWIF();
        } catch {
          // Imported QTUM accounts can already be stored as WIF.
        }

        for (const fallbackNetwork of [qtumNetwork, qtumTestnetNetwork]) {
          try {
            return ECPair.fromWIF(privateKey, fallbackNetwork).toWIF();
          } catch {
            // Try the next QTUM network before failing.
          }
        }

        throw new Error("Invalid QTUM private key format");
      }
    }
  }

  public isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  public isValidPrivateKey(
    rawPrivateKey: string,
    pkType: QTUMImportPKType,
  ): boolean {
    try {
      if (pkType === QTUMImportPKType.QTUM_WIF) {
        // Try mainnet
        try {
          ECPair.fromWIF(rawPrivateKey, qtumNetwork);
          return true;
        } catch (e) {
          // Try testnet
          ECPair.fromWIF(rawPrivateKey, qtumTestnetNetwork);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  public deriveAccount(
    privateKey: string,
    option: QTUMAccountOption,
  ): { address: string; publicKey: string } {
    const payment = option?.payment ?? "p2pkh";
    const networkType = option?.network ?? "mainnet";
    const network =
      networkType === "mainnet" ? qtumNetwork : qtumTestnetNetwork;

    // Strip 0x prefix if present (getPrivateKeyString() returns 0x-prefixed hex)
    const rawKey = privateKey.startsWith("0x")
      ? privateKey.slice(2)
      : privateKey;

    const keyPair = ECPair.fromPrivateKey(Buffer.from(rawKey, "hex"), {
      network,
    });

    let address: string;

    switch (payment) {
      case "p2pkh": {
        const { address: addr } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network,
        });
        address = addr!;
        break;
      }
      case "p2sh": {
        const { address: addr } = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network,
          }),
          network,
        });
        address = addr!;
        break;
      }
      case "p2wpkh": {
        const { address: addr } = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        });
        address = addr!;
        break;
      }
      case "p2tr": {
        const { address: addr } = bitcoin.payments.p2tr({
          internalPubkey: keyPair.publicKey.slice(1, 33),
          network,
        });
        address = addr!;
        break;
      }
      default:
        throw new Error(`Unsupported payment type: ${payment}`);
    }

    return {
      address,
      publicKey: keyPair.publicKey.toString("hex"),
    };
  }
}

export const qtumBasic = new QTUMBasic();
