import { errorCodes, ProviderError } from "@/scripts/content/ErrorCode";
import type {
  ETHGetBalanceParams,
  ETHRequestParams,
} from "../servers/IWalletServer";

type BalanceRpcRequest = ETHRequestParams<ETHGetBalanceParams> & {
  jsonrpc: "2.0";
};

export async function getEthBalance(
  payload: ETHRequestParams<ETHGetBalanceParams>,
  call: (request: BalanceRpcRequest) => Promise<{ result?: unknown }>,
): Promise<string> {
  const params = payload?.params;
  if (
    !Array.isArray(params) ||
    params.length < 1 ||
    params.length > 2 ||
    typeof params[0] !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(params[0])
  ) {
    throw new ProviderError(
      errorCodes.rpc.invalidParams,
      "eth_getBalance requires an EVM address and an optional block parameter",
    );
  }

  // Keep block tags, block numbers and EIP-1898 selectors intact for the node.
  // Balance queries are public reads and do not require account authorization.
  const response = await call({
    jsonrpc: "2.0",
    id: payload.id,
    method: "eth_getBalance",
    params: [params[0], params[1] === undefined ? "latest" : params[1]],
  });
  if (
    typeof response?.result !== "string" ||
    !/^0x[0-9a-fA-F]+$/.test(response.result)
  ) {
    throw new ProviderError(
      errorCodes.rpc.internal,
      "Invalid eth_getBalance RPC response",
    );
  }
  // JSON-RPC quantities have no leading zeroes. Avoid Number precision loss.
  return `0x${BigInt(response.result).toString(16)}`;
}
