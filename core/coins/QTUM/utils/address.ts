import * as bitcoin from "bitcoinjs-lib";
import { qtumNetwork, qtumTestnetNetwork } from "../constants";

export type AddressType = "p2pkh" | "p2sh" | "p2wpkh" | "p2tr";

export function isAddress(address: string): boolean {
  try {
    // Try mainnet
    bitcoin.address.toOutputScript(address, qtumNetwork);
    return true;
  } catch (e) {
    try {
      // Try testnet
      bitcoin.address.toOutputScript(address, qtumTestnetNetwork);
      return true;
    } catch (e2) {
      return false;
    }
  }
}

export function getAddressType(address: string): AddressType | null {
  if (!isAddress(address)) {
    return null;
  }

  // P2PKH: starts with Q (mainnet) or q (testnet)
  if (address.startsWith("Q") || address.startsWith("q")) {
    return "p2pkh";
  }

  // P2SH: starts with M (mainnet) or m (testnet)
  if (address.startsWith("M") || address.startsWith("m")) {
    return "p2sh";
  }

  // SegWit: starts with qc1 (mainnet) or tq1 (testnet)
  if (address.startsWith("qc1") || address.startsWith("tq1")) {
    if (address.length === 42) {
      return "p2wpkh";
    }
    if (address.length === 62) {
      return "p2tr";
    }
  }

  return null;
}

export function getEvmAddress(address: string): string {
  // If already EVM format, return as-is
  if (address.startsWith("0x")) {
    return address.toLowerCase();
  }

  // Convert UTXO address to EVM address
  try {
    const decoded = bitcoin.address.fromBase58Check(address);
    return "0x" + Buffer.from(decoded.hash).toString("hex");
  } catch (e) {
    try {
      const decoded = bitcoin.address.fromBech32(address);
      return "0x" + Buffer.from(decoded.data).toString("hex");
    } catch (e2) {
      throw new Error("Invalid QTUM address");
    }
  }
}

export function decodeEvmAddress(
  evmAddress: string,
  network: bitcoin.Network,
): string {
  const hash = Buffer.from(evmAddress.slice(2), "hex");
  return bitcoin.address.toBase58Check(hash, network.pubKeyHash);
}

export function getHash160Address(address: string): string {
  try {
    const decoded = bitcoin.address.fromBase58Check(address);
    return Buffer.from(decoded.hash).toString("hex");
  } catch (e) {
    try {
      const decoded = bitcoin.address.fromBech32(address);
      return Buffer.from(decoded.data).toString("hex");
    } catch (e2) {
      throw new Error("Invalid QTUM address");
    }
  }
}
