import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export type ProvableScannerNetwork = "mainnet" | "testnet";

export function networkFromChainId(chainId: string): ProvableScannerNetwork {
  if (chainId === "mainnet" || chainId === InnerChainUniqueId.ALEO_MAINNET) {
    return "mainnet";
  }
  throw new Error(`unsupported Aleo scanner chain: ${chainId}`);
}

export function scannerPath(network: ProvableScannerNetwork): string {
  return `/scanner/${network}`;
}
