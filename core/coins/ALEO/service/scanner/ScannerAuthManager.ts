import {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import { createRequestInstance } from "@/common/utils/request";
import {
  type JWTToken,
  type ProvableApiKey,
  type ProvableAuthRegisterRequest,
  type ProvableAuthRegisterResponse,
  type ProvableJWTResponse,
  type TeePubkey,
} from "./ScannerTypes";
import { ScannerStorage } from "./ScannerStorage";
import { type ProvableScannerNetwork, scannerPath } from "./network";

const PROVABLE_EXPLORER_API = "https://api.provable.com";
const JWT_REFRESH_GRACE_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_HEADERS = { "Content-Type": "application/json" };

type RetryOptions = {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
};

type JsonResponse<T> = {
  data: T;
  headers: Headers;
};

const delay = async (ms: number) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

async function retry<T>(
  task: () => Promise<T>,
  { maxAttempts, initialDelayMs, maxDelayMs }: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await task();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      const delayMs = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
      await delay(delayMs);
    }
  }
  throw lastError;
}

export class ScannerAuthManager {
  private readonly storage: ScannerStorage;
  private readonly baseURL: string;
  private jwtTokenPromise: Promise<JWTToken> | null = null;
  private refreshJWTTokenPromise: Promise<JWTToken> | null = null;

  constructor(
    storage = ScannerStorage.getInstance(),
    baseURL = PROVABLE_EXPLORER_API,
  ) {
    this.storage = storage;
    this.baseURL = baseURL;
  }

  async authenticateNewUser(): Promise<ProvableApiKey> {
    return await retry(
      async () => {
        const username = crypto.randomUUID();
        const registerRequest: ProvableAuthRegisterRequest = { username };
        const response = await this.postJson<ProvableAuthRegisterResponse>(
          "/consumers",
          registerRequest,
          DEFAULT_HEADERS,
        );

        const apiKey: ProvableApiKey = {
          consumerId: response.data.consumer.id,
          createdAt: response.data.createdAt,
          key: response.data.key,
        };
        await this.storage.setProvableApiKey(apiKey);
        return apiKey;
      },
      {
        maxAttempts: 5,
        initialDelayMs: 300,
        maxDelayMs: 4000,
      },
    );
  }

  async retrieveJWTToken(): Promise<JWTToken> {
    return await retry(
      async () => {
        let provableApiKey = await this.storage.getProvableApiKey();
        if (!provableApiKey) {
          provableApiKey = await this.authenticateNewUser();
        }

        const response = await this.postJson<ProvableJWTResponse>(
          `/jwts/${provableApiKey.consumerId}`,
          {},
          {
            ...DEFAULT_HEADERS,
            "X-Provable-API-Key": provableApiKey.key,
          },
        );

        const authorization = this.getAuthorizationHeader(response);
        if (!authorization) {
          throw new Error("failed to get scanner jwt token");
        }

        const jwtToken: JWTToken = {
          authToken: authorization.replace("Bearer ", ""),
          expirationAt: response.data.exp,
        };
        await this.storage.setJWTToken(jwtToken);
        return jwtToken;
      },
      {
        maxAttempts: 3,
        initialDelayMs: 300,
        maxDelayMs: 4000,
      },
    );
  }

  async getApiKey(): Promise<JWTToken> {
    if (this.jwtTokenPromise) {
      return await this.jwtTokenPromise;
    }

    const existingToken = await this.storage.getJWTToken();
    if (existingToken && this.isJWTTokenValid(existingToken)) {
      return existingToken;
    }

    this.jwtTokenPromise = this.retrieveJWTToken();
    try {
      return await this.jwtTokenPromise;
    } finally {
      this.jwtTokenPromise = null;
    }
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const apiKey = await this.getApiKey();
    return {
      Authorization: `Bearer ${apiKey.authToken}`,
    };
  }

  async getScannerPubkey(network: ProvableScannerNetwork): Promise<TeePubkey> {
    const instance = this.createProvableRequestInstance();
    const authHeaders = await this.getAuthHeaders();
    const pubkey = await instance.get<never, TeePubkey>(
      `${scannerPath(network)}/pubkey`,
      {
        headers: {
          ...authHeaders,
        },
      },
    );

    if (!this.isTeePubkey(pubkey)) {
      throw new Error("scanner /pubkey response missing key_id/public_key");
    }
    return pubkey;
  }

  createProvableRequestInstance(
    timeout = DEFAULT_TIMEOUT_MS,
    headers: Record<string, string> = DEFAULT_HEADERS,
  ): AxiosInstance {
    const instance = createRequestInstance(this.baseURL, timeout, headers);

    // Request interceptor: convert camelCase request bodies into the
    // snake_case wire format Provable expects. Downstream callers always
    // pass camelCase; we never let snake_case escape this module.
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (config.data && isPlainJsonObject(config.data)) {
        config.data = snakecaseKeys(config.data as Record<string, unknown>, {
          deep: true,
        });
      }
      return config;
    });

    // Response interceptor: convert snake_case response bodies (already
    // unwrapped to `data` by createRequestInstance's interceptor) into
    // camelCase. Runs BEFORE the 401 handler below (axios runs response
    // interceptors in registration order for the success path).
    instance.interceptors.response.use((data: unknown) => {
      if (isPlainJsonObject(data) || Array.isArray(data)) {
        return camelcaseKeys(data as Record<string, unknown>, { deep: true });
      }
      return data;
    });

    instance.interceptors.response.use(undefined, async (err: AxiosError) => {
      const { config, response } = err;
      if (response?.status === 401 && config) {
        return await this.retryUnauthorizedRequest(instance, config);
      }
      throw err;
    });

    return instance;
  }

  private async retryUnauthorizedRequest(
    instance: AxiosInstance,
    config: InternalAxiosRequestConfig,
  ) {
    const jwtToken = await this.getJWTTokenForFailedRequest(config);
    config.headers.Authorization = `Bearer ${jwtToken.authToken}`;
    return await instance.request(config);
  }

  private async getJWTTokenForFailedRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<JWTToken> {
    const failedToken = this.getAuthorizationTokenFromConfig(config);
    const existingToken = await this.storage.getJWTToken();
    if (
      existingToken &&
      this.isJWTTokenValid(existingToken) &&
      existingToken.authToken !== failedToken
    ) {
      return existingToken;
    }

    return await this.refreshJWTToken();
  }

  private async refreshJWTToken(): Promise<JWTToken> {
    if (this.refreshJWTTokenPromise) {
      return await this.refreshJWTTokenPromise;
    }

    this.refreshJWTTokenPromise = this.retrieveJWTToken();
    try {
      return await this.refreshJWTTokenPromise;
    } finally {
      this.refreshJWTTokenPromise = null;
    }
  }

  private isJWTTokenValid(token: JWTToken) {
    return Date.now() <= token.expirationAt * 1000 - JWT_REFRESH_GRACE_MS;
  }

  private getAuthorizationHeader(response: JsonResponse<ProvableJWTResponse>) {
    const authorization = response.headers.get("authorization");
    if (authorization) {
      return authorization;
    }
    return "";
  }

  private getAuthorizationTokenFromConfig(
    config: InternalAxiosRequestConfig,
  ): string | null {
    const headers = config.headers as unknown as {
      get?: (name: string) => unknown;
      Authorization?: unknown;
      authorization?: unknown;
    };
    const authorization =
      (typeof headers.get === "function"
        ? headers.get("Authorization") ?? headers.get("authorization")
        : undefined) ??
      headers.Authorization ??
      headers.authorization;

    if (typeof authorization !== "string") {
      return null;
    }

    return authorization.replace(/^Bearer\s+/i, "");
  }

  private isTeePubkey(value: unknown): value is TeePubkey {
    if (typeof value !== "object" || value === null) return false;
    if (!("keyId" in value) || !("publicKey" in value)) return false;
    const { keyId, publicKey } = value as {
      keyId: unknown;
      publicKey: unknown;
    };
    return typeof keyId === "string" && typeof publicKey === "string";
  }

  // POST helper for the auth endpoints (/consumers, /jwts/{id}) that run
  // BEFORE we have a JWT and therefore can't go through the axios instance
  // (which is configured around the auth header). Mirrors the axios
  // interceptors' case-conversion contract: camelCase in, camelCase out.
  private async postJson<T>(
    path: string,
    body: unknown,
    headers: Record<string, string>,
  ): Promise<JsonResponse<T>> {
    const snakeBody = isPlainJsonObject(body)
      ? snakecaseKeys(body as Record<string, unknown>, { deep: true })
      : body;

    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(snakeBody),
    });

    if (!response.ok) {
      throw new Error(
        `scanner auth request failed: ${response.status} ${response.statusText}`,
      );
    }

    const raw = (await response.json()) as unknown;
    const data = (
      isPlainJsonObject(raw) || Array.isArray(raw)
        ? camelcaseKeys(raw as Record<string, unknown>, { deep: true })
        : raw
    ) as T;

    return {
      data,
      headers: response.headers,
    };
  }
}

// Treat only plain JSON objects as candidates for case conversion.
// snakecase-keys / camelcase-keys would otherwise walk class instances,
// Maps, Buffers, etc. and mangle them.
function isPlainJsonObject(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export const scannerAuthManager = new ScannerAuthManager();
