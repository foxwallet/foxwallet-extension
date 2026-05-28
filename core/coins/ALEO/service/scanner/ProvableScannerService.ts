import { type AxiosError, type AxiosInstance } from "axios";
import {
  type OwnedRecordsReq,
  type OwnedRecordsResp,
  type RecordFilter,
  type ResponseFilter,
  type RecordsTagsReq,
  type RecordsTagsResp,
  type RegisterReq,
  type RegisterResp,
  type SyncStatusResp,
} from "./ScannerTypes";
import { scannerAuthManager } from "./ScannerAuthManager";
import type { ScannerAuthManager } from "./ScannerAuthManager";
import { ScannerStorage } from "./ScannerStorage";
import {
  type ProvableScannerNetwork,
  networkFromChainId,
  scannerPath,
} from "./network";

const OWNED_RESULTS_PER_PAGE_LIMIT = 1000;
const TAGS_REQUEST_SIZE_LIMIT = 1000;
const MAX_UUID_REREGISTER_ATTEMPTS = 3;
const DEFAULT_SCANNER_NETWORK: ProvableScannerNetwork = "mainnet";
const DEFAULT_OWNED_RECORD_RESPONSE_FILTER: ResponseFilter = {
  blockHeight: true,
  blockTimestamp: true,
  commitment: true,
  recordCiphertext: true,
  functionName: true,
  outputIndex: true,
  programName: true,
  recordName: true,
  transactionId: true,
  transitionId: true,
};

export type RssRefreshMode = "hard" | "light" | "unknown";
export type RssEndpoint = "owned" | "tags";

export interface RssDiagnosticsRequestMeta {
  refreshMode?: RssRefreshMode;
  endpoint?: RssEndpoint;
  network?: ProvableScannerNetwork;
}

export interface RssCallDiagnostic {
  endpoint: RssEndpoint;
  refreshMode: RssRefreshMode;
  network: ProvableScannerNetwork;
  lastCallAt?: number;
  statusCode?: number;
  success?: boolean;
  error?: string;
}

export interface ScannerUuidOwner {
  chainId: string;
  address: string;
  network: ProvableScannerNetwork;
}

export interface ScannerRegistrationPayload {
  publicKey: string;
  viewKey: string;
  start: number;
}

export type ScannerRegistrationEncryptor = (
  payload: ScannerRegistrationPayload,
) => Promise<string>;

export type ScannerRegisterRequestResolver = (
  owner: ScannerUuidOwner,
) => Promise<RegisterReq | undefined>;

export interface ProvableScannerServiceOptions {
  authManager?: ScannerAuthManager;
  storage?: ScannerStorage;
  defaultNetwork?: ProvableScannerNetwork;
  encryptRegistration?: ScannerRegistrationEncryptor;
  resolveRegisterRequest?: ScannerRegisterRequestResolver;
}

export interface ScannerRegisterOptions {
  // address is required: without it the UUID would not be persisted, leaving
  // an orphan scanner on the RSS side that we can never reach via 422
  // self-heal. scannerRegister fail-fasts if it's missing.
  address: string;
  chainId?: string;
}

type FetchOwnedRecordsPageResult = {
  records?: OwnedRecordsResp;
  effectiveUuid: string;
};

export class ProvableScannerService {
  private readonly authManager: ScannerAuthManager;
  private readonly storage: ScannerStorage;
  private readonly request: AxiosInstance;

  private defaultNetwork: ProvableScannerNetwork;

  private encryptRegistration?: ScannerRegistrationEncryptor;

  private resolveRegisterRequest?: ScannerRegisterRequestResolver;

  private readonly scannerRegisterPromises = new Map<
    string,
    Promise<RegisterResp | undefined>
  >();

  private readonly scannerReregisterPromises = new Map<
    string,
    Promise<string | undefined>
  >();

  private readonly scannerRegistrationStartHeights = new Map<string, number>();

  private readonly uuidReregisterAttempts = new Map<string, number>();

  private readonly rssDiagnostics = new Map<string, RssCallDiagnostic>();

  constructor(options: ProvableScannerServiceOptions = {}) {
    this.authManager = options.authManager ?? scannerAuthManager;
    this.storage = options.storage ?? ScannerStorage.getInstance();
    this.defaultNetwork = options.defaultNetwork ?? DEFAULT_SCANNER_NETWORK;
    this.encryptRegistration = options.encryptRegistration;
    this.resolveRegisterRequest = options.resolveRegisterRequest;
    this.request = this.authManager.createProvableRequestInstance();
  }

  configure(options: {
    defaultNetwork?: ProvableScannerNetwork;
    encryptRegistration?: ScannerRegistrationEncryptor;
    resolveRegisterRequest?: ScannerRegisterRequestResolver;
  }) {
    if (options.defaultNetwork) {
      this.defaultNetwork = options.defaultNetwork;
    }
    if (options.encryptRegistration) {
      this.encryptRegistration = options.encryptRegistration;
    }
    if (options.resolveRegisterRequest) {
      this.resolveRegisterRequest = options.resolveRegisterRequest;
    }
  }

  async scannerRegister(
    req: RegisterReq,
    network: ProvableScannerNetwork = this.defaultNetwork,
    options?: ScannerRegisterOptions,
  ): Promise<RegisterResp | undefined> {
    if (!options?.address) {
      throw new Error(
        "scannerRegister requires options.address to persist the UUID; " +
          "registering without an address would leave an orphan scanner on RSS",
      );
    }
    if (!this.resolveRegisterRequest) {
      throw new Error(
        "scannerRegister requires resolveRegisterRequest to be configured " +
          "before any registration; 422 self-heal cannot recover without it",
      );
    }

    const key = this.scannerRegisterPromiseKey(req, network, options);
    const existing = this.scannerRegisterPromises.get(key);
    if (existing) {
      return await existing;
    }

    const registerPromise = (async () => {
      try {
        const ret = await this.scannerRegisterEncrypted(req, network);
        if (ret.uuid) {
          const chainId = options.chainId ?? network;
          await this.storage.setScannerUuid(chainId, options.address, ret.uuid);
          this.scannerRegistrationStartHeights.set(
            this.scannerStartHeightKey(chainId, options.address),
            req.start ?? 0,
          );
        }
        console.debug("[RSS] Scanner registration succeeded", {
          network,
          uuid: ret.uuid,
          status: ret.status,
        });
        return ret;
      } catch (error) {
        console.error("[RSS] Scanner registration failed", {
          network,
          start: req.start ?? 0,
          error,
        });
        return undefined;
      } finally {
        this.scannerRegisterPromises.delete(key);
      }
    })();

    this.scannerRegisterPromises.set(key, registerPromise);
    return await registerPromise;
  }

  async getOwnedRecords(
    req: OwnedRecordsReq,
    meta?: RssDiagnosticsRequestMeta,
  ): Promise<OwnedRecordsResp | undefined> {
    const targetNetwork = await this.resolveNetwork(req.uuid, meta?.network);
    const path = `${scannerPath(targetNetwork)}/records/owned`;
    const authHeaders = await this.authManager.getAuthHeaders();
    const requestedPage = req.filter?.page ?? 0;
    const requestedResultsPerPage = req.filter?.resultsPerPage;
    const pageSize =
      Number.isFinite(requestedResultsPerPage) && requestedResultsPerPage! > 0
        ? Math.min(
            Math.trunc(requestedResultsPerPage!),
            OWNED_RESULTS_PER_PAGE_LIMIT,
          )
        : OWNED_RESULTS_PER_PAGE_LIMIT;

    const allRecords: OwnedRecordsResp = [];
    let currentPage = requestedPage;
    let currentUuid = req.uuid;

    while (true) {
      const baseFilter: RecordFilter = {
        ...(req.filter ?? {}),
        response: {
          ...DEFAULT_OWNED_RECORD_RESPONSE_FILTER,
          ...(req.filter?.response ?? {}),
        },
      };
      const pageReq: OwnedRecordsReq = {
        ...req,
        uuid: currentUuid,
        filter: {
          ...baseFilter,
          page: currentPage,
          resultsPerPage: pageSize,
        },
      };

      const pageResult = await this.fetchOwnedRecordsPage(
        path,
        pageReq,
        authHeaders,
        targetNetwork,
        meta,
      );
      if (!pageResult.records) {
        return undefined;
      }

      currentUuid = pageResult.effectiveUuid;
      allRecords.push(...pageResult.records);

      if (pageResult.records.length < pageSize) {
        return allRecords;
      }

      currentPage += 1;
    }
  }

  async getRecordsTags(
    req: RecordsTagsReq,
    meta?: RssDiagnosticsRequestMeta,
  ): Promise<RecordsTagsResp | undefined> {
    const refreshMode = meta?.refreshMode ?? "unknown";
    const endpoint = meta?.endpoint ?? "tags";
    const targetNetwork = meta?.network ?? this.defaultNetwork;
    const path = `${scannerPath(targetNetwork)}/records/tags`;
    const authHeaders = await this.authManager.getAuthHeaders();

    if (req.length === 0) {
      return {};
    }

    const mergedResponse: RecordsTagsResp = {};
    let hasAnySuccess = false;

    for (let i = 0; i < req.length; i += TAGS_REQUEST_SIZE_LIMIT) {
      const chunk = req.slice(i, i + TAGS_REQUEST_SIZE_LIMIT);
      try {
        const chunkResp = await this.request.post<
          RecordsTagsReq,
          RecordsTagsResp
        >(path, chunk, {
          headers: {
            ...authHeaders,
          },
        });
        this.setRssDiagnostic(endpoint, refreshMode, targetNetwork, 200, true);
        Object.assign(mergedResponse, chunkResp);
        hasAnySuccess = true;
      } catch (error) {
        const statusCode = this.isAxiosError(error)
          ? error.response?.status
          : undefined;
        this.setRssDiagnostic(
          endpoint,
          refreshMode,
          targetNetwork,
          statusCode,
          false,
          error instanceof Error ? error.message : "tags call failed",
        );
        console.error("[RSS] /records/tags chunk failed", error);
      }
    }

    return hasAnySuccess ? mergedResponse : undefined;
  }

  async getLatestNetworkBlockHeight(
    network: ProvableScannerNetwork = this.defaultNetwork,
  ): Promise<number | undefined> {
    const path = `/v2/${network}/block/height/latest`;
    const authHeaders = await this.authManager.getAuthHeaders();
    try {
      const res = await this.request.get<never, number | string>(path, {
        headers: {
          ...authHeaders,
        },
      });
      if (typeof res === "number" && Number.isFinite(res)) {
        return res;
      }
      if (typeof res === "string") {
        const parsed = Number(res.trim());
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return undefined;
    } catch (error) {
      console.error("[RSS] failed to fetch latest network block height", error);
      return undefined;
    }
  }

  async getSyncStatus(
    uuid: string,
    network?: ProvableScannerNetwork,
  ): Promise<SyncStatusResp | undefined> {
    const targetNetwork = await this.resolveNetwork(uuid, network);
    const path = `${scannerPath(targetNetwork)}/status`;
    const authHeaders = await this.authManager.getAuthHeaders();
    const effectiveUuid = await this.waitForReregistrationIfInFlight(uuid);

    try {
      return await this.request.post<string, SyncStatusResp>(
        path,
        effectiveUuid,
        {
          headers: {
            ...authHeaders,
          },
        },
      );
    } catch (error) {
      if (this.isUuidNotRegisteredError(error)) {
        console.warn("[RSS] UUID rejected in /status, re-registering", {
          uuid: effectiveUuid,
          network: targetNetwork,
        });
        const refreshedUuid =
          await this.reregisterScannerForUuid(effectiveUuid);
        if (refreshedUuid) {
          try {
            console.debug("[RSS] Retrying /status after re-registration", {
              previousUuid: effectiveUuid,
              retryUuid: refreshedUuid,
            });
            return await this.request.post<string, SyncStatusResp>(
              path,
              refreshedUuid,
              {
                headers: {
                  ...authHeaders,
                },
              },
            );
          } catch (retryError) {
            if (this.isUuidNotRegisteredError(retryError)) {
              await this.handleUuidNotRegistered(refreshedUuid);
            }
            console.error("[RSS] /status retry failed", {
              uuid: refreshedUuid,
              error: retryError,
            });
          }
        }
      } else {
        console.error("[RSS] /status failed", error);
      }
      return undefined;
    }
  }

  getRssDiagnostics(): RssCallDiagnostic[] {
    return [...this.rssDiagnostics.values()];
  }

  getRegistrationStartHeight(
    chainId: string,
    address: string,
  ): number | undefined {
    return this.scannerRegistrationStartHeights.get(
      this.scannerStartHeightKey(chainId, address),
    );
  }

  private async scannerRegisterEncrypted(
    req: RegisterReq,
    network: ProvableScannerNetwork,
  ): Promise<RegisterResp> {
    if (!this.encryptRegistration) {
      throw new Error("scanner registration encryptor is not configured");
    }

    const authHeaders = await this.authManager.getAuthHeaders();
    const pubkey = await this.authManager.getScannerPubkey(network);
    const ciphertext = await this.encryptRegistration({
      publicKey: pubkey.publicKey,
      viewKey: req.viewKey,
      start: req.start ?? 0,
    });

    return await this.request.post<
      { keyId: string; ciphertext: string },
      RegisterResp
    >(
      `${scannerPath(network)}/register/encrypted`,
      {
        keyId: pubkey.keyId,
        ciphertext,
      },
      {
        headers: {
          ...authHeaders,
        },
      },
    );
  }

  private async fetchOwnedRecordsPage(
    path: string,
    req: OwnedRecordsReq,
    authHeaders: Record<string, string>,
    targetNetwork: ProvableScannerNetwork,
    meta?: RssDiagnosticsRequestMeta,
  ): Promise<FetchOwnedRecordsPageResult> {
    const refreshMode = meta?.refreshMode ?? "unknown";
    const endpoint = meta?.endpoint ?? "owned";
    const effectiveUuid = await this.waitForReregistrationIfInFlight(req.uuid);
    const effectiveReq =
      effectiveUuid === req.uuid ? req : { ...req, uuid: effectiveUuid };

    try {
      const records = await this.request.post<
        OwnedRecordsReq,
        OwnedRecordsResp
      >(path, effectiveReq, {
        headers: {
          ...authHeaders,
        },
      });
      this.setRssDiagnostic(endpoint, refreshMode, targetNetwork, 200, true);
      return { records, effectiveUuid: effectiveReq.uuid };
    } catch (error) {
      const statusCode = this.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (this.isUuidNotRegisteredError(error)) {
        console.warn("[RSS] UUID rejected in /records/owned, re-registering", {
          uuid: effectiveReq.uuid,
          network: targetNetwork,
        });
        const refreshedUuid = await this.reregisterScannerForUuid(
          effectiveReq.uuid,
        );
        if (refreshedUuid) {
          console.debug(
            "[RSS] Scanner UUID refreshed during /records/owned; deferring pagination retry",
            {
              previousUuid: effectiveReq.uuid,
              refreshedUuid,
            },
          );
          this.setRssDiagnostic(
            endpoint,
            refreshMode,
            targetNetwork,
            statusCode,
            false,
            "owned call deferred after scanner re-registration",
          );
          return { records: undefined, effectiveUuid: refreshedUuid };
        }
      } else {
        console.error("[RSS] /records/owned failed", error);
      }

      this.setRssDiagnostic(
        endpoint,
        refreshMode,
        targetNetwork,
        statusCode,
        false,
        error instanceof Error ? error.message : "owned call failed",
      );
      return { records: undefined, effectiveUuid: effectiveReq.uuid };
    }
  }

  private async waitForReregistrationIfInFlight(uuid: string): Promise<string> {
    const owner = await this.findUuidOwner(uuid);
    if (!owner) {
      return uuid;
    }

    const inFlight = this.scannerReregisterPromises.get(this.ownerKey(owner));
    if (!inFlight) {
      return uuid;
    }

    console.debug("[RSS] Waiting for in-flight scanner re-registration", owner);
    const refreshedUuid = await inFlight;
    return refreshedUuid ?? (await this.getLatestUuidForOwner(owner)) ?? uuid;
  }

  private async reregisterScannerForUuid(
    staleUuid: string,
  ): Promise<string | undefined> {
    const attempts = this.uuidReregisterAttempts.get(staleUuid) ?? 0;
    if (attempts >= MAX_UUID_REREGISTER_ATTEMPTS) {
      await this.handleUuidNotRegistered(staleUuid);
      return undefined;
    }
    this.uuidReregisterAttempts.set(staleUuid, attempts + 1);

    const owner = await this.findUuidOwner(staleUuid);
    if (!owner) {
      console.warn(
        "[RSS] Unable to re-register scanner, UUID owner not found",
        staleUuid,
      );
      return undefined;
    }

    const ownerLockKey = this.ownerKey(owner);
    const existing = this.scannerReregisterPromises.get(ownerLockKey);
    if (existing) {
      console.debug("[RSS] Joining in-flight scanner re-registration", owner);
      return await existing;
    }

    const reregisterPromise = (async () => {
      if (!this.resolveRegisterRequest) {
        // Programming error: 422 self-heal fired before background wired
        // resolveRegisterRequest. Surface loudly instead of silently clearing
        // the UUID — clearing would mask the misconfiguration.
        throw new Error(
          "scanner 422 self-heal fired before resolveRegisterRequest was " +
            "configured; check background bootstrap order",
        );
      }
      const registerReq = await this.resolveRegisterRequest(owner);
      if (!registerReq) {
        // Resolver returned nothing → account/viewKey is genuinely
        // unavailable (account removed, keyring locked, etc). Clearing the
        // stale UUID is the right thing here.
        console.error(
          "[RSS] Missing view key for scanner re-registration",
          owner,
        );
        await this.handleUuidNotRegistered(staleUuid);
        return undefined;
      }

      console.warn("[RSS] Re-registering scanner UUID after 422", {
        owner,
        staleUuid,
      });
      const registration = await this.scannerRegister(
        registerReq,
        owner.network,
        {
          chainId: owner.chainId,
          address: owner.address,
        },
      );
      if (!registration?.uuid) {
        console.error("[RSS] Scanner re-registration failed", owner);
        await this.handleUuidNotRegistered(staleUuid);
        return undefined;
      }

      this.uuidReregisterAttempts.delete(staleUuid);
      console.debug("[RSS] Scanner UUID re-registration succeeded", {
        owner,
        staleUuid,
        nextUuid: registration.uuid,
      });
      return registration.uuid;
    })();

    this.scannerReregisterPromises.set(ownerLockKey, reregisterPromise);
    try {
      return await reregisterPromise;
    } finally {
      this.scannerReregisterPromises.delete(ownerLockKey);
    }
  }

  private async findUuidOwner(
    uuid: string,
  ): Promise<ScannerUuidOwner | undefined> {
    const entry = await this.storage.findScannerUuidOwner(uuid);
    if (!entry) {
      return undefined;
    }

    try {
      return {
        chainId: entry.chainId,
        address: entry.address,
        network: networkFromChainId(entry.chainId),
      };
    } catch (error) {
      console.warn("[RSS] Scanner UUID has unsupported chain", {
        uuid,
        chainId: entry.chainId,
        error,
      });
      return undefined;
    }
  }

  private async handleUuidNotRegistered(uuid?: string): Promise<void> {
    if (!uuid) return;
    const owner = await this.findUuidOwner(uuid);
    if (!owner) {
      await this.storage.clearScannerUuidByUuid(uuid);
      return;
    }

    this.scannerRegistrationStartHeights.delete(
      this.scannerStartHeightKey(owner.chainId, owner.address),
    );
    await this.storage.clearScannerUuid(owner.chainId, owner.address);
    console.warn(
      `Cleared stale scanner UUID for ${owner.address} on ${owner.chainId}`,
    );
  }

  private async getLatestUuidForOwner(
    owner: ScannerUuidOwner,
  ): Promise<string | null> {
    return await this.storage.getScannerUuid(owner.chainId, owner.address);
  }

  private async resolveNetwork(
    uuid?: string,
    network?: ProvableScannerNetwork,
  ): Promise<ProvableScannerNetwork> {
    if (network) {
      return network;
    }
    if (!uuid) {
      return this.defaultNetwork;
    }
    const owner = await this.findUuidOwner(uuid);
    return owner?.network ?? this.defaultNetwork;
  }

  private ownerKey(owner: { chainId: string; address: string }): string {
    return `${owner.chainId}:${owner.address}`;
  }

  // scannerRegister enforces options.address, so the promise key is always
  // (network, chainId, address, start). viewKey is intentionally NOT part of
  // the key: address is derived from viewKey, so the tuple already identifies
  // the credential without putting it in memory state.
  private scannerRegisterPromiseKey(
    req: RegisterReq,
    network: ProvableScannerNetwork,
    options: ScannerRegisterOptions,
  ): string {
    const start = req.start ?? 0;
    const chainId = options.chainId ?? network;
    return `${network}:${chainId}:${options.address}:${start}`;
  }

  private scannerStartHeightKey(chainId: string, address: string): string {
    return `${chainId}:${address}`;
  }

  private setRssDiagnostic(
    endpoint: RssEndpoint,
    refreshMode: RssRefreshMode,
    network: ProvableScannerNetwork,
    statusCode: number | undefined,
    success: boolean,
    error?: string,
  ): void {
    const key = `${network}:${endpoint}:${refreshMode}`;
    this.rssDiagnostics.set(key, {
      endpoint,
      refreshMode,
      network,
      lastCallAt: Date.now(),
      statusCode,
      success,
      error,
    });
  }

  private isUuidNotRegisteredError(error: unknown): boolean {
    return this.isAxiosError(error) && error.response?.status === 422;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === "object" && error !== null && "isAxiosError" in error
    );
  }
}

export const provableScannerService = new ProvableScannerService();
