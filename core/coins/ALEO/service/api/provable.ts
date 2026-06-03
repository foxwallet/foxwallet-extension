import { get } from "@/common/utils/request";

export const PROVABLE_EXPLORER_API = "https://api.provable.com";
const PROVABLE_API = `${PROVABLE_EXPLORER_API}/v2`;

// Wire shape of one row returned by /{network}/transactions/address/{addr}.
// Fields are snake_case on the wire — we camelCase them in the
// getTransferHistory adapter below before returning.
export interface ProvableTransferHistoryRow {
  transactionId: string;
  transitionId: string;
  transactionStatus: string; // "Accepted" | "Rejected" | "Pending" | "Confirmed"
  blockNumber: number;
  blockTimestamp: number | string; // string on the wire, normalized to number
  functionId: string; // e.g. "transfer_public"
  programId: string;
  amount?: number | string;
  senderAddress?: string;
  recipientAddress?: string;
  tokenId?: string;
  assetSymbol?: string;
}

export interface ProvableTransferHistoryCursor {
  blockNumber: number;
  transitionId: string;
}

export interface ProvableTransferHistoryResp {
  address: string;
  transactions: ProvableTransferHistoryRow[];
  prevCursor: ProvableTransferHistoryCursor | null;
  nextCursor: ProvableTransferHistoryCursor | null;
}

interface RawTransferHistoryRow {
  transaction_id: string;
  transition_id: string;
  transaction_status: string;
  block_number: number;
  block_timestamp: number | string;
  function_id: string;
  program_id: string;
  amount?: number | string;
  sender_address?: string;
  recipient_address?: string;
  token_id?: string;
  asset_symbol?: string;
}

interface RawTransferHistoryResp {
  address: string;
  transactions?: RawTransferHistoryRow[];
  prev_cursor?: { block_number: number; transition_id: string } | null;
  next_cursor?: { block_number: number; transition_id: string } | null;
}

export class ProvableApi {
  private readonly baseURL: string;

  constructor(baseURL: string = PROVABLE_API) {
    this.baseURL = baseURL;
  }

  async getTransferHistory(params: {
    network: string;
    address: string;
    offset?: number;
    limit?: number;
    cursorBlockNumber?: number;
    cursorTransitionId?: string;
  }): Promise<ProvableTransferHistoryResp> {
    const {
      network,
      address,
      offset,
      limit: requestedLimit = 50,
      cursorBlockNumber,
      cursorTransitionId,
    } = params;

    // The Provable explorer enforces a hard cap: limit must be in [1, 50].
    const limit = Math.min(50, Math.max(1, requestedLimit));

    const search = new URLSearchParams();
    search.set("limit", String(limit));
    search.set("token_info", "true");
    if (cursorBlockNumber !== undefined && cursorTransitionId !== undefined) {
      search.set("cursor_block_number", String(cursorBlockNumber));
      search.set("cursor_transition_id", cursorTransitionId);
    } else if (offset !== undefined) {
      search.set("offset", String(offset));
    }

    const url = `${this.baseURL}/${network}/transactions/address/${address}?${search.toString()}`;
    const response = await get(url);
    if (!response.ok) {
      throw new Error(
        `ProvableApi getTransferHistory error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    const raw = (await response.json()) as RawTransferHistoryResp;
    const rows = raw.transactions ?? [];
    return {
      address: raw.address,
      transactions: rows.map<ProvableTransferHistoryRow>((row) => ({
        transactionId: row.transaction_id,
        transitionId: row.transition_id,
        transactionStatus: row.transaction_status,
        blockNumber: row.block_number,
        blockTimestamp: Number(row.block_timestamp),
        functionId: row.function_id,
        programId: row.program_id,
        amount: row.amount,
        senderAddress: row.sender_address,
        recipientAddress: row.recipient_address,
        tokenId: row.token_id,
        assetSymbol: row.asset_symbol,
      })),
      prevCursor: raw.prev_cursor
        ? {
            blockNumber: raw.prev_cursor.block_number,
            transitionId: raw.prev_cursor.transition_id,
          }
        : null,
      nextCursor: raw.next_cursor
        ? {
            blockNumber: raw.next_cursor.block_number,
            transitionId: raw.next_cursor.transition_id,
          }
        : null,
    };
  }

  async getProgramMappingValue(params: {
    network: string;
    programId: string;
    mappingName: string;
    key: string;
  }): Promise<string | null> {
    const { network, programId, mappingName, key } = params;
    const url = `${this.baseURL}/${network}/program/${programId}/mapping/${mappingName}/${key}`;
    const response = await get(url);
    if (!response.ok) {
      throw new Error(
        `ProvableApi getProgramMappingValue error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    const value = await response.json();
    if (value === null || value === "null") {
      return null;
    }
    return value as string;
  }

  async getPublicBalance(
    network: string,
    address: string,
  ): Promise<string | null> {
    return await this.getProgramMappingValue({
      network,
      programId: "credits.aleo",
      mappingName: "account",
      key: address,
    });
  }

  // Returns the addresses currently on the freezelist as decimal U256 strings.
  // Used by ComplianceService to build the Sealance non-inclusion Merkle tree.
  async getProgramFreezeList(
    network: string,
    freezelistProgramId: string,
  ): Promise<string[]> {
    const url = `${this.baseURL}/${network}/programs/${freezelistProgramId}/compliance/freeze-list`;
    const response = await get(url);
    if (!response.ok) {
      throw new Error(
        `ProvableApi getProgramFreezeList error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    const value = (await response.json()) as unknown;
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === "string");
  }
}
