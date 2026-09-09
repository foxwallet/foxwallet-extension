import { errorCodes, ProviderError } from "@/scripts/content/ErrorCode";

interface RpcPreference {
  url: string;
  requestSequence: number;
}

const NON_IDEMPOTENT_METHODS = new Set([
  "eth_sendRawTransaction",
  "eth_sendTransaction",
  "sendrawtransaction",
  "qtum_sendrawtransaction",
]);

export default class RPCServer {
  // Shared by the per-request instances created by the ETH and Qtum servers.
  // Each configured list has its own preference for this background session.
  private static preferences = new Map<string, RpcPreference>();
  private static requestSequence = 0;
  readonly rpcUrlList: readonly string[];
  private readonly preferenceKey: string;
  private readonly timeoutMs: number;

  constructor(rpcUrlList: string[], { timeoutMs = 10_000 } = {}) {
    this.rpcUrlList = [...new Set(rpcUrlList)];
    if (!this.rpcUrlList.length) {
      throw new Error("No RPC URLs configured");
    }
    this.preferenceKey = JSON.stringify(this.rpcUrlList);
    this.timeoutMs = timeoutMs;
  }

  get currentRpcIndex() {
    const preferred = RPCServer.preferences.get(this.preferenceKey);
    return preferred ? this.rpcUrlList.indexOf(preferred.url) : 0;
  }

  async call(payload: any): Promise<any> {
    const sequence = ++RPCServer.requestSequence;
    const firstIndex = this.currentRpcIndex;
    let lastError: unknown;
    let providerError: ProviderError | undefined;

    // Snapshot the starting node. Concurrent calls must not change this call's
    // traversal, and each distinct endpoint is tried at most once.
    for (let offset = 0; offset < this.rpcUrlList.length; offset++) {
      const index = (firstIndex + offset) % this.rpcUrlList.length;
      const url = this.rpcUrlList[index];
      const controller = new AbortController();
      let timeout: ReturnType<typeof setTimeout> | undefined;

      try {
        const deadline = new Promise<never>((_, reject) => {
          timeout = setTimeout(() => {
            reject(
              new Error(`RPC request timed out after ${this.timeoutMs}ms`),
            );
            controller.abort();
          }, this.timeoutMs);
        });
        const request = (async () => {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`RPC HTTP error ${response.status}`);
          }
          return response.json();
        })();
        // Include response-body parsing in the deadline, not just HTTP headers.
        const json = await Promise.race([request, deadline]);
        if (
          !json ||
          typeof json !== "object" ||
          Array.isArray(json) ||
          json.jsonrpc !== "2.0" ||
          json.id !== payload.id
        ) {
          throw new Error("Invalid JSON-RPC response");
        }
        if (json.error != null) {
          throw new ProviderError(
            typeof json.error.code === "number"
              ? json.error.code
              : errorCodes.rpc.internal,
            json.error.message || "RPC error",
          );
        }
        if (!Object.prototype.hasOwnProperty.call(json, "result")) {
          throw new Error("Missing JSON-RPC result");
        }

        const previous = RPCServer.preferences.get(this.preferenceKey);
        // A late response from an older request must not undo a newer choice.
        if (!previous || sequence >= previous.requestSequence) {
          RPCServer.preferences.set(this.preferenceKey, {
            url,
            requestSequence: sequence,
          });
        }
        return json;
      } catch (error) {
        lastError = error;
        if (error instanceof ProviderError) {
          providerError ??= error;
          if (NON_IDEMPOTENT_METHODS.has(payload?.method)) {
            throw error;
          }
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    if (providerError) {
      throw providerError;
    }
    throw new Error(
      `All ${this.rpcUrlList.length} RPC URLs failed: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  }
}
