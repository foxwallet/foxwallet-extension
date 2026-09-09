import { CoinType } from "core/types";
import type { ContentServerMethod } from "@/scripts/background/servers/IWalletServer";

const evmMethods = [
  "eth_accounts",
  "eth_getBalance",
  "eth_requestAccounts",
  "wallet_getPermissions",
  "wallet_requestPermissions",
  "wallet_revokePermissions",
  "personal_sign",
  "personal_ecRecover",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "eth_signTypedData",
  "eth_sendTransaction",
  "wallet_watchAsset",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "_setGlobalChainId",
  "_getGlobalChainId",
  "proxyRPCCall",
] as const;

// This list is the page API, not every property on the wallet server class.
export const CONTENT_METHODS: {
  [C in CoinType]: ReadonlyArray<ContentServerMethod<C>>;
} = {
  [CoinType.ALEO]: [
    "connect",
    "disconnect",
    "decrypt",
    "requestRecords",
    "requestRecordPlaintexts",
    "requestTransaction",
    "signMessage",
    "requestExecution",
    "requestBulkTransactions",
    "requestDeploy",
    "transactionStatus",
    "getExecution",
    "requestTransactionHistory",
  ],
  [CoinType.ETH]: evmMethods,
  [CoinType.QTUM]: evmMethods,
};

export function isContentMethod(
  coinType: unknown,
  method: unknown,
): method is ContentServerMethod<CoinType> {
  return (
    typeof coinType === "string" &&
    Object.prototype.hasOwnProperty.call(CONTENT_METHODS, coinType) &&
    typeof method === "string" &&
    (CONTENT_METHODS[coinType as CoinType] as readonly string[]).includes(
      method,
    )
  );
}
