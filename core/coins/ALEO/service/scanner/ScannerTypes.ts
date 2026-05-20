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
