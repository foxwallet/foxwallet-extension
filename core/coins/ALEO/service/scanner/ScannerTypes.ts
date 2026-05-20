// All RSS request/response types here use camelCase field names.
// The actual wire format is snake_case; conversion happens in the axios
// instance returned by ScannerAuthManager.createProvableRequestInstance:
//   - response interceptor: snake_case -> camelCase via camelcase-keys
//   - request interceptor:  camelCase  -> snake_case via snakecase-keys
// Downstream code (ProvableScannerService, RecordSyncService, etc.) should
// never see snake_case keys.

export interface ProvableAuthRegisterRequest {
  username: string;
}

export interface ProvableAuthRegisterResponse {
  consumer: {
    id: string;
  };
  id: string;
  createdAt: number;
  key: string;
}

export interface ProvableJWTResponse {
  exp: number;
}

export interface ProvableApiKey {
  consumerId: string;
  createdAt: number;
  key: string;
}

export interface JWTToken {
  authToken: string;
  expirationAt: number;
}

export interface ScannerUuidEntry {
  chainId: string;
  address: string;
  uuid: string;
}

export interface TeePubkey {
  keyId: string;
  publicKey: string;
}

export interface RegisterReq {
  viewKey: string;
  start?: number;
}

export interface RegisterResp {
  uuid: string;
  jobId?: string;
  status?: string;
}

export interface ResponseFilter {
  blockHeight?: boolean;
  checksum?: boolean;
  commitment?: boolean;
  recordCiphertext?: boolean;
  functionName?: boolean;
  nonce?: boolean;
  outputIndex?: boolean;
  owner?: boolean;
  programName?: boolean;
  recordName?: boolean;
  transactionId?: boolean;
  transitionId?: boolean;
  transactionIndex?: boolean;
  transitionIndex?: boolean;
}

export interface RecordFilter {
  commitments?: string[];
  start?: number;
  end?: number;
  programs?: string[];
  records?: string[];
  functions?: string[];
  resultsPerPage?: number;
  page?: number;
  response?: ResponseFilter;
}

export interface OwnedRecordsReq {
  uuid: string;
  unspent?: boolean;
  filter?: RecordFilter;
}

export type ViewRefreshMode = "auto" | "hard" | "light" | "none";

export interface RecordSyncRequestOptions {
  purpose?: "default" | "view";
  consumerId?: string;
  refreshMode?: ViewRefreshMode;
  chainId?: string;
}

// Cipher half of an RSS owned-record response. Fields mirror the
// /scanner/{network}/records/owned API exactly (after snake -> camel
// conversion in createProvableRequestInstance). Optional flags follow
// the API: every field except tag/programName may be omitted depending
// on the ResponseFilter the request opted into.
//
// NOTE: blockHeight is a string on the wire (e.g. "1234567"), not a
// number — the API returns it as a stringified integer.
export interface CypherOwnedRecord {
  blockHeight?: string;
  commitment?: string;
  functionName?: string;
  outputIndex?: number;
  owner?: string;
  programName: string;
  recordCiphertext?: string;
  recordName?: string;
  spent?: boolean;
  tag: string;
  transactionId?: string;
  transitionId?: string;
  transactionIndex?: number;
  transitionIndex?: number;
}

// Plaintext-bearing owned record. The RSS returns the decrypted Aleo
// record string in `recordPlaintext` when the consumer has registered
// their view key — that's the field downstream code parses via
// RecordPlaintext.fromString().
export interface OwnedRecord extends CypherOwnedRecord {
  recordPlaintext: string;
}

export type OwnedRecordWithAmount = OwnedRecord & {
  recordAmount?: bigint;
};

export type OwnedRecordsResp = CypherOwnedRecord[];

export type RecordsTagsReq = string[];

export type RecordsTagsMap = Record<string, boolean>;

export type RecordsTagsResp = RecordsTagsMap;

export interface SyncStatusResp {
  synced?: boolean;
  percentage?: number;
}
