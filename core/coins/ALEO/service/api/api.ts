import { get } from "@/common/utils/request";
import { type AleoTransactionWithHeight } from "../../types/Transaction";
import { normalizeTransaction } from "./transaction";
import { PROVABLE_API } from "./provable";

// Transaction metadata comes from the official Explorer, not the node's raw transaction route.
export class AleoWalletApi {
  host: string;
  chainId: string;

  constructor({ host, chainId }: { host: string; chainId: string }) {
    // Older environment artifacts still contain the retired Fox wallet endpoints.
    this.host =
      /^https:\/\/aleo[1-5]-web3\.foxnb\.net\/proxy\/extension\/v1\/aleo\/?$/.test(
        host,
      )
        ? PROVABLE_API
        : host.replace(/\/$/, "");
    this.chainId = chainId;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  async getTransaction(
    id: string,
  ): Promise<AleoTransactionWithHeight | undefined> {
    const response = await get(
      `${this.host}/${this.chainId}/transactions/${encodeURIComponent(id)}`,
    );
    // Indexing may lag behind broadcast. A missing transaction is still unconfirmed.
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(
        `Official Aleo transaction request failed: statusCode ${response.status}`,
      );
    }
    return normalizeTransaction(await response.json(), id);
  }
}
