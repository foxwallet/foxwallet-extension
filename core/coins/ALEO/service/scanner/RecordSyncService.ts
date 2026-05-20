import { ViewKey } from "aleo_wasm_mainnet";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  type CypherOwnedRecord,
  type OwnedRecord,
  type OwnedRecordsReq,
  type OwnedRecordsResp,
  type RecordFilter,
  type RecordSyncRequestOptions,
} from "./ScannerTypes";
import {
  provableScannerService,
  type ProvableScannerService,
} from "./ProvableScannerService";
import { type ProvableScannerNetwork, networkFromChainId } from "./network";
import { ownedToRecordDetail } from "./recordAdapter";

type InFlightEntry<T> = {
  inFlight?: Promise<T | undefined>;
  lastAt?: number;
  lastResp?: T | undefined;
};

type RefreshMode = "light" | "hard";

export type RecordSyncGetRecordsOptions = RecordSyncRequestOptions & {
  onViewUpdate?: () => void;
};

export interface RecordSyncAccount {
  address: string;
  viewKey: string;
}

export type RecordSyncShouldSkip = () => boolean;

export interface RecordSyncServiceOptions {
  scannerService?: ProvableScannerService;
  defaultChainId?: string;
  shouldSkip?: RecordSyncShouldSkip;
}

type ViewScope = {
  key: string;
  chainId: string;
  network: ProvableScannerNetwork;
  uuid: string;
  address: string;
  recordsByKey: Map<string, CypherOwnedRecord>;
  consumerPrograms: Map<string, string[]>;
  consumerCallbacks: Map<string, () => void>;
  hardTimer?: ReturnType<typeof setInterval>;
  lightTimer?: ReturnType<typeof setInterval>;
  refreshInFlight?: Promise<boolean>;
  refreshInFlightMode?: RefreshMode;
  pendingHardRefresh: boolean;
  initialized: boolean;
  lastHardRefreshAt: number;
  lastRssCallNetworkBlockHeight: number;
};

const COOLDOWN_MS = 2000;
const LIGHT_REFRESH_MS = 10_000;
const HARD_REFRESH_MS = 60_000;
const LIGHT_OVERLAP_GUARD_MS = 10_000;
const RECORD_SYNC_BLOCK_HEIGHT_LOOKBACK = 30;
const OWNED_RESULTS_PER_PAGE_LIMIT = 1000;
const DEFAULT_CHAIN_ID = InnerChainUniqueId.ALEO_MAINNET;

const sorted = (list?: string[]) => {
  if (!list) return [];
  return [...list].sort();
};

const normalizeResponseFilter = (response?: RecordFilter["response"]) => {
  if (!response) {
    return undefined;
  }
  return Object.keys(response)
    .sort()
    .reduce<Record<string, boolean | undefined>>((acc, key) => {
      const typedKey = key as keyof NonNullable<RecordFilter["response"]>;
      acc[key] = response[typedKey];
      return acc;
    }, {});
};

const normalizeFilter = (filter?: RecordFilter) => {
  if (!filter) {
    return undefined;
  }
  return {
    commitments: sorted(filter.commitments),
    end: filter.end,
    functions: sorted(filter.functions),
    page: filter.page,
    programs: sorted(filter.programs),
    records: sorted(filter.records),
    response: normalizeResponseFilter(filter.response),
    resultsPerPage: filter.resultsPerPage,
    start: filter.start,
  };
};

const buildExactCacheKey = (chainId: string, req: OwnedRecordsReq) => {
  return JSON.stringify({
    chainId,
    filter: normalizeFilter(req.filter),
    unspent: req.unspent ?? "all",
    uuid: req.uuid,
  });
};

const buildAccountExactCacheKey = (
  chainId: string,
  address: string,
  req: OwnedRecordsReq,
) => {
  return JSON.stringify({
    address,
    chainId,
    filter: normalizeFilter(req.filter),
    unspent: req.unspent ?? "all",
    uuid: req.uuid,
  });
};

const buildScopedCacheKey = (chainId: string, req: OwnedRecordsReq) => {
  const programKey = JSON.stringify(sorted(req.filter?.programs));
  const stateKey =
    req.unspent === undefined ? "all" : req.unspent ? "unspent" : "spent";
  return `${chainId}:${req.uuid}:${programKey}:${stateKey}`;
};

const hasCustomResponseFilter = (filter?: RecordFilter) => {
  return Boolean(filter?.response && Object.keys(filter.response).length > 0);
};

const buildScopedOwnedRequest = (req: OwnedRecordsReq): OwnedRecordsReq => {
  const programs = sorted(req.filter?.programs);
  return {
    uuid: req.uuid,
    ...(req.unspent !== undefined ? { unspent: req.unspent } : {}),
    ...(programs.length > 0
      ? {
          filter: {
            programs,
          },
        }
      : {}),
  };
};

const buildOwnedCachePlan = (
  chainId: string,
  req: OwnedRecordsReq,
): {
  key: string;
  fetchReq: OwnedRecordsReq;
  applyLocalFilter: boolean;
} => {
  if (hasCustomResponseFilter(req.filter)) {
    return {
      applyLocalFilter: false,
      fetchReq: req,
      key: buildExactCacheKey(chainId, req),
    };
  }

  return {
    applyLocalFilter: true,
    fetchReq: buildScopedOwnedRequest(req),
    key: buildScopedCacheKey(chainId, req),
  };
};

const recordHeight = (record: CypherOwnedRecord): number | undefined => {
  if (!record.blockHeight) return undefined;
  const parsed = Number(record.blockHeight);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const filterRecordsByRequest = (
  records: OwnedRecordsResp | undefined,
  req: OwnedRecordsReq,
): OwnedRecordsResp | undefined => {
  if (!records) {
    return undefined;
  }

  const programs = new Set(sorted(req.filter?.programs));
  const commitments = new Set(sorted(req.filter?.commitments));
  const recordNames = new Set(sorted(req.filter?.records));
  const functions = new Set(sorted(req.filter?.functions));
  const start = req.filter?.start;
  const end = req.filter?.end;
  const page = req.filter?.page;
  const requestedPageSize = req.filter?.resultsPerPage;

  const filtered = records.filter((record) => {
    if (programs.size > 0 && !programs.has(record.programName)) {
      return false;
    }
    if (
      commitments.size > 0 &&
      (!record.commitment || !commitments.has(record.commitment))
    ) {
      return false;
    }
    if (
      recordNames.size > 0 &&
      (!record.recordName || !recordNames.has(record.recordName))
    ) {
      return false;
    }
    if (
      functions.size > 0 &&
      (!record.functionName || !functions.has(record.functionName))
    ) {
      return false;
    }
    if (req.unspent === true && record.spent) {
      return false;
    }
    if (req.unspent === false && !record.spent) {
      return false;
    }
    const height = recordHeight(record);
    if (start !== undefined && (height ?? -1) < start) {
      return false;
    }
    if (end !== undefined && (height ?? Number.MAX_SAFE_INTEGER) > end) {
      return false;
    }
    return true;
  });

  if (page === undefined || page <= 0) {
    return filtered;
  }

  const pageSize =
    Number.isFinite(requestedPageSize) && requestedPageSize! > 0
      ? Math.min(Math.trunc(requestedPageSize!), OWNED_RESULTS_PER_PAGE_LIMIT)
      : OWNED_RESULTS_PER_PAGE_LIMIT;
  const offset = Math.trunc(page) * pageSize;
  return filtered.slice(offset, offset + pageSize);
};

const maybeFilterRecordsByCachePlan = (
  records: OwnedRecordsResp | undefined,
  req: OwnedRecordsReq,
  applyLocalFilter: boolean,
): OwnedRecordsResp | undefined => {
  return applyLocalFilter ? filterRecordsByRequest(records, req) : records;
};

export class RecordSyncService {
  private readonly scannerService: ProvableScannerService;

  private readonly ownedCache = new Map<
    string,
    InFlightEntry<OwnedRecordsResp>
  >();

  private readonly decryptedCache = new Map<
    string,
    InFlightEntry<RecordDetailWithSpent[]>
  >();

  private readonly plaintextCache = new Map<string, string>();

  private readonly viewScopes = new Map<string, ViewScope>();

  private readonly consumerToScope = new Map<string, string>();

  private defaultChainId: string;
  private shouldSkipCallback: RecordSyncShouldSkip;

  constructor(options: RecordSyncServiceOptions = {}) {
    this.scannerService = options.scannerService ?? provableScannerService;
    this.defaultChainId = options.defaultChainId ?? DEFAULT_CHAIN_ID;
    this.shouldSkipCallback = options.shouldSkip ?? (() => false);
  }

  configure(options: {
    defaultChainId?: string;
    shouldSkip?: RecordSyncShouldSkip;
  }): void {
    if (options.defaultChainId) {
      this.defaultChainId = options.defaultChainId;
    }
    if (options.shouldSkip) {
      this.shouldSkipCallback = options.shouldSkip;
    }
  }

  deactivateViewConsumer(consumerId: string): void {
    const currentScopeKey = this.consumerToScope.get(consumerId);
    if (!currentScopeKey) {
      return;
    }

    this.consumerToScope.delete(consumerId);

    const scope = this.viewScopes.get(currentScopeKey);
    if (!scope) {
      return;
    }

    scope.consumerPrograms.delete(consumerId);
    scope.consumerCallbacks.delete(consumerId);
    if (scope.consumerPrograms.size === 0) {
      this.disposeScope(currentScopeKey, scope);
    }
  }

  async getOwnedRecords(
    req: OwnedRecordsReq,
    options: RecordSyncRequestOptions = {},
  ): Promise<OwnedRecordsResp | undefined> {
    const chainId = this.resolveChainId(options);
    const cachePlan = buildOwnedCachePlan(chainId, req);
    if (options.purpose === "view") {
      console.warn(
        "[RecordSyncService] getOwnedRecords(view) called without account, defaulting to direct fetch",
      );
    }
    const entry = this.ownedCache.get(cachePlan.key) ?? {};

    if (entry.inFlight) {
      return maybeFilterRecordsByCachePlan(
        await entry.inFlight,
        req,
        cachePlan.applyLocalFilter,
      );
    }

    const now = Date.now();
    if (entry.lastAt && now - entry.lastAt < COOLDOWN_MS) {
      return maybeFilterRecordsByCachePlan(
        entry.lastResp,
        req,
        cachePlan.applyLocalFilter,
      );
    }

    let result: OwnedRecordsResp | undefined;
    const promise = (async () => {
      result = await this.scannerService.getOwnedRecords(cachePlan.fetchReq, {
        endpoint: "owned",
        network: networkFromChainId(chainId),
        refreshMode: "unknown",
      });
      return result;
    })();

    entry.inFlight = promise;
    this.ownedCache.set(cachePlan.key, entry);

    try {
      return maybeFilterRecordsByCachePlan(
        await promise,
        req,
        cachePlan.applyLocalFilter,
      );
    } finally {
      entry.inFlight = undefined;
      entry.lastAt = Date.now();
      entry.lastResp = result;
      this.ownedCache.set(cachePlan.key, entry);
    }
  }

  async getDecryptedOwnedRecords(
    req: OwnedRecordsReq,
    account: RecordSyncAccount,
    options: RecordSyncGetRecordsOptions = {},
  ): Promise<RecordDetailWithSpent[] | undefined> {
    const chainId = this.resolveChainId(options);

    if (options.purpose === "view") {
      const encryptedRecords = await this.getViewOwnedRecords(
        req,
        account,
        options,
      );
      return this.decryptAndAdaptRecords(
        encryptedRecords ?? [],
        account,
        chainId,
      );
    }

    const key = buildAccountExactCacheKey(chainId, account.address, req);
    const entry = this.decryptedCache.get(key) ?? {};

    if (entry.inFlight) {
      return await entry.inFlight;
    }

    const now = Date.now();
    if (entry.lastAt && now - entry.lastAt < COOLDOWN_MS) {
      return entry.lastResp;
    }

    let result: RecordDetailWithSpent[] | undefined;
    const promise = (async () => {
      const encryptedRecords = await this.getOwnedRecords(req, options);
      if (!encryptedRecords) {
        return undefined;
      }
      result = this.decryptAndAdaptRecords(encryptedRecords, account, chainId);
      return result;
    })();

    entry.inFlight = promise;
    this.decryptedCache.set(key, entry);

    try {
      return await promise;
    } finally {
      entry.inFlight = undefined;
      entry.lastAt = Date.now();
      entry.lastResp = result;
      this.decryptedCache.set(key, entry);
    }
  }

  getDebugState(): {
    ownedCacheSize: number;
    decryptedCacheSize: number;
    plaintextCacheSize: number;
    viewScopeCount: number;
    consumerScopeCount: number;
    viewScopes: Array<{
      scopeKey: string;
      chainId: string;
      network: ProvableScannerNetwork;
      uuid: string;
      address: string;
      recordsCount: number;
      consumerCount: number;
      initialized: boolean;
      refreshInFlight: boolean;
      refreshInFlightMode?: RefreshMode;
      pendingHardRefresh: boolean;
      lastHardRefreshAt: number;
      lastRssCallNetworkBlockHeight: number;
    }>;
  } {
    return {
      consumerScopeCount: this.consumerToScope.size,
      decryptedCacheSize: this.decryptedCache.size,
      ownedCacheSize: this.ownedCache.size,
      plaintextCacheSize: this.plaintextCache.size,
      viewScopeCount: this.viewScopes.size,
      viewScopes: [...this.viewScopes.values()].map((scope) => ({
        address: scope.address,
        chainId: scope.chainId,
        consumerCount: scope.consumerPrograms.size,
        initialized: scope.initialized,
        lastHardRefreshAt: scope.lastHardRefreshAt,
        lastRssCallNetworkBlockHeight: scope.lastRssCallNetworkBlockHeight,
        network: scope.network,
        pendingHardRefresh: scope.pendingHardRefresh,
        recordsCount: scope.recordsByKey.size,
        refreshInFlight: Boolean(scope.refreshInFlight),
        refreshInFlightMode: scope.refreshInFlightMode,
        scopeKey: scope.key,
        uuid: scope.uuid,
      })),
    };
  }

  private clearScopeTimers(scope: ViewScope): void {
    if (scope.hardTimer) {
      clearInterval(scope.hardTimer);
      scope.hardTimer = undefined;
    }
    if (scope.lightTimer) {
      clearInterval(scope.lightTimer);
      scope.lightTimer = undefined;
    }
  }

  private disposeScope(scopeKey: string, scope: ViewScope): void {
    this.clearScopeTimers(scope);
    this.viewScopes.delete(scopeKey);
  }

  private getScopePrograms(scope: ViewScope): string[] {
    const all = new Set<string>();
    for (const programs of scope.consumerPrograms.values()) {
      for (const programId of programs) {
        all.add(programId);
      }
    }
    return [...all];
  }

  private getScopeRecords(scope: ViewScope): CypherOwnedRecord[] {
    return [...scope.recordsByKey.values()];
  }

  private recordDedupeKey(record: CypherOwnedRecord): string {
    if (record.tag) return `tag:${record.tag}`;
    if (record.commitment) return `commitment:${record.commitment}`;
    return `fallback:${record.programName}:${record.transactionId ?? ""}:${
      record.transitionId ?? ""
    }:${record.outputIndex ?? ""}`;
  }

  private mergeRecord(
    current: CypherOwnedRecord | undefined,
    incoming: CypherOwnedRecord,
  ): CypherOwnedRecord {
    if (!current) {
      return incoming;
    }
    return {
      ...current,
      ...incoming,
      programName: incoming.programName,
      spent: Boolean(current.spent) || Boolean(incoming.spent),
      tag: incoming.tag,
    };
  }

  private isRecordEqual(a: CypherOwnedRecord, b: CypherOwnedRecord): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private mergeRecordsIntoScope(
    scope: ViewScope,
    records: CypherOwnedRecord[],
  ): boolean {
    let changed = false;
    for (const record of records) {
      const key = this.recordDedupeKey(record);
      const previous = scope.recordsByKey.get(key);
      const merged = this.mergeRecord(previous, record);
      if (!previous || !this.isRecordEqual(previous, merged)) {
        scope.recordsByKey.set(key, merged);
        changed = true;
      }
    }
    return changed;
  }

  // Hard refresh path. Unlike a naive "replace with RSS truth", we merge
  // each incoming record with the existing one (via `mergeRecord`) so that
  // `spent:true` survives — RSS may legitimately drop already-spent records
  // from its `unspent`/sliding window response, and dropping our local
  // spent flag would violate the §5.4 spent-win invariant.
  private replaceRecordsForPrograms(
    scope: ViewScope,
    programs: Set<string>,
    records: CypherOwnedRecord[],
  ): boolean {
    const existingByKey = new Map<string, CypherOwnedRecord>();
    for (const [key, record] of scope.recordsByKey.entries()) {
      if (programs.has(record.programName)) {
        existingByKey.set(key, record);
      }
    }

    const nextByKey = new Map<string, CypherOwnedRecord>();
    for (const record of records) {
      const key = this.recordDedupeKey(record);
      nextByKey.set(key, this.mergeRecord(existingByKey.get(key), record));
    }

    let changed = existingByKey.size !== nextByKey.size;
    if (!changed) {
      for (const [key, record] of nextByKey.entries()) {
        const previous = existingByKey.get(key);
        if (!previous || !this.isRecordEqual(previous, record)) {
          changed = true;
          break;
        }
      }
    }

    for (const [key, existing] of [...scope.recordsByKey.entries()]) {
      if (programs.has(existing.programName)) {
        scope.recordsByKey.delete(key);
      }
    }

    for (const [key, record] of nextByKey.entries()) {
      scope.recordsByKey.set(key, record);
    }
    return changed;
  }

  private async updateSpentFromTags(scope: ViewScope): Promise<boolean> {
    const tags = this.getScopeRecords(scope)
      .map((record) => (record.spent ? undefined : record.tag))
      .filter((tag): tag is string => Boolean(tag));

    if (tags.length === 0) {
      return false;
    }

    const tagsResp = await this.scannerService.getRecordsTags(
      [...new Set(tags)],
      {
        endpoint: "tags",
        network: scope.network,
        refreshMode: "light",
      },
    );
    if (!tagsResp) {
      return false;
    }

    let changed = false;
    for (const [key, record] of scope.recordsByKey.entries()) {
      if (record.spent || !record.tag) continue;
      const spentNow = tagsResp[record.tag];
      if (spentNow) {
        scope.recordsByKey.set(key, { ...record, spent: true });
        changed = true;
      }
    }
    return changed;
  }

  private async fetchOwnedAndHeight(
    req: OwnedRecordsReq,
    network: ProvableScannerNetwork,
    refreshMode: RefreshMode | "unknown",
  ): Promise<{ records?: OwnedRecordsResp; latestHeight?: number }> {
    const [ownedRes, heightRes] = await Promise.allSettled([
      this.scannerService.getOwnedRecords(req, {
        endpoint: "owned",
        network,
        refreshMode,
      }),
      this.scannerService.getLatestNetworkBlockHeight(network),
    ]);
    const records =
      ownedRes.status === "fulfilled" ? ownedRes.value ?? undefined : undefined;
    const latestHeight =
      heightRes.status === "fulfilled" ? heightRes.value : undefined;
    return { records, latestHeight };
  }

  private notifyScopeConsumers(scope: ViewScope): void {
    for (const callback of scope.consumerCallbacks.values()) {
      try {
        callback();
      } catch (error) {
        console.error(
          "[RecordSyncService] view consumer callback failed",
          error,
        );
      }
    }
  }

  private async refreshScope(
    scope: ViewScope,
    mode: RefreshMode,
  ): Promise<boolean> {
    if (scope.refreshInFlight) {
      const inFlightPromise = scope.refreshInFlight;
      const inFlightMode = scope.refreshInFlightMode;
      if (mode === "hard" && inFlightMode === "light") {
        scope.pendingHardRefresh = true;
      }

      const changedWhileWaiting = await inFlightPromise;
      if (mode !== "hard" || inFlightMode === "hard") {
        return changedWhileWaiting;
      }

      const nextInFlight = scope.refreshInFlight;
      if (nextInFlight !== undefined && nextInFlight !== inFlightPromise) {
        const followUpChanged = await nextInFlight;
        return changedWhileWaiting || followUpChanged;
      }

      if (!scope.pendingHardRefresh) {
        return changedWhileWaiting;
      }

      scope.pendingHardRefresh = false;
      const hardChanged = await this.refreshScope(scope, "hard");
      return changedWhileWaiting || hardChanged;
    }

    if (mode === "hard") {
      scope.pendingHardRefresh = false;
    }

    const refreshPromise = (async () => {
      const programs = this.getScopePrograms(scope);
      if (programs.length === 0) {
        return false;
      }

      let changed = false;
      if (mode === "light") {
        changed = (await this.updateSpentFromTags(scope)) || changed;
      }

      const start =
        mode === "light"
          ? Math.max(
              scope.lastRssCallNetworkBlockHeight -
                RECORD_SYNC_BLOCK_HEIGHT_LOOKBACK,
              0,
            )
          : undefined;
      const req: OwnedRecordsReq = {
        filter: {
          programs,
          ...(start !== undefined ? { start } : {}),
        },
        uuid: scope.uuid,
      };

      const { records, latestHeight } = await this.fetchOwnedAndHeight(
        req,
        scope.network,
        mode,
      );

      if (!records) {
        if (changed) {
          this.notifyScopeConsumers(scope);
        }
        return changed;
      }

      if (latestHeight !== undefined) {
        scope.lastRssCallNetworkBlockHeight = latestHeight;
      }

      if (mode === "hard") {
        const scopedPrograms = new Set(programs);
        changed =
          this.replaceRecordsForPrograms(scope, scopedPrograms, records) ||
          changed;
        scope.lastHardRefreshAt = Date.now();
      } else {
        changed = this.mergeRecordsIntoScope(scope, records) || changed;
      }

      if (changed) {
        this.notifyScopeConsumers(scope);
      }
      return changed;
    })();

    scope.refreshInFlight = refreshPromise;
    scope.refreshInFlightMode = mode;
    try {
      return await refreshPromise;
    } finally {
      scope.refreshInFlight = undefined;
      scope.refreshInFlightMode = undefined;
    }
  }

  private shouldSkip(): boolean {
    return this.shouldSkipCallback();
  }

  private ensureScopeTimers(scope: ViewScope): void {
    if (!scope.hardTimer) {
      scope.hardTimer = setInterval(() => {
        if (this.shouldSkip()) {
          return;
        }
        void this.refreshScope(scope, "hard");
      }, HARD_REFRESH_MS);
    }

    if (!scope.lightTimer) {
      scope.lightTimer = setInterval(() => {
        const now = Date.now();
        const msSinceHard = now - scope.lastHardRefreshAt;

        if (
          this.shouldSkip() ||
          msSinceHard >= HARD_REFRESH_MS - LIGHT_OVERLAP_GUARD_MS
        ) {
          return;
        }
        void this.refreshScope(scope, "light");
      }, LIGHT_REFRESH_MS);
    }
  }

  private async getOrCreateViewScope(
    req: OwnedRecordsReq,
    account: RecordSyncAccount,
    options: RecordSyncGetRecordsOptions,
  ): Promise<ViewScope> {
    const chainId = this.resolveChainId(options);
    const network = networkFromChainId(chainId);
    const scopeKey = `${chainId}:${req.uuid}:${account.address}`;
    const programs = sorted(req.filter?.programs);
    const consumerId = options.consumerId;
    const currentScopeKey = consumerId
      ? this.consumerToScope.get(consumerId)
      : undefined;

    if (consumerId && currentScopeKey && currentScopeKey !== scopeKey) {
      this.deactivateViewConsumer(consumerId);
    }

    let scope = this.viewScopes.get(scopeKey);
    if (!scope) {
      scope = {
        address: account.address,
        chainId,
        consumerCallbacks: new Map(),
        consumerPrograms: new Map(),
        initialized: false,
        key: scopeKey,
        lastHardRefreshAt: 0,
        lastRssCallNetworkBlockHeight: 0,
        network,
        pendingHardRefresh: false,
        recordsByKey: new Map(),
        uuid: req.uuid,
      };
      this.viewScopes.set(scopeKey, scope);
    }

    if (consumerId) {
      scope.consumerPrograms.set(consumerId, programs);
      if (options.onViewUpdate) {
        scope.consumerCallbacks.set(consumerId, options.onViewUpdate);
      } else {
        scope.consumerCallbacks.delete(consumerId);
      }
      this.consumerToScope.set(consumerId, scopeKey);
    }

    this.ensureScopeTimers(scope);
    return scope;
  }

  private filterViewRecords(
    records: CypherOwnedRecord[],
    req: OwnedRecordsReq,
  ): OwnedRecordsResp {
    const programs = new Set(sorted(req.filter?.programs));
    const commitments = new Set(sorted(req.filter?.commitments));
    const recordNames = new Set(sorted(req.filter?.records));
    const functions = new Set(sorted(req.filter?.functions));
    const start = req.filter?.start;
    const end = req.filter?.end;

    return records.filter((record) => {
      if (programs.size > 0 && !programs.has(record.programName)) {
        return false;
      }
      if (
        commitments.size > 0 &&
        (!record.commitment || !commitments.has(record.commitment))
      ) {
        return false;
      }
      if (
        recordNames.size > 0 &&
        (!record.recordName || !recordNames.has(record.recordName))
      ) {
        return false;
      }
      if (
        functions.size > 0 &&
        (!record.functionName || !functions.has(record.functionName))
      ) {
        return false;
      }
      if (req.unspent === true && record.spent) {
        return false;
      }
      if (req.unspent === false && !record.spent) {
        return false;
      }
      const height = recordHeight(record);
      if (start !== undefined && (height ?? -1) < start) {
        return false;
      }
      if (end !== undefined && (height ?? Number.MAX_SAFE_INTEGER) > end) {
        return false;
      }
      return true;
    });
  }

  private async getViewOwnedRecords(
    req: OwnedRecordsReq,
    account: RecordSyncAccount,
    options: RecordSyncGetRecordsOptions,
  ): Promise<OwnedRecordsResp | undefined> {
    const consumerId = options.consumerId;
    if (!consumerId) {
      console.warn(
        "[RecordSyncService] view purpose requires consumerId, defaulting to direct fetch",
      );
      return await this.getOwnedRecords(req, {
        ...options,
        purpose: "default",
      });
    }

    const scope = await this.getOrCreateViewScope(req, account, options);
    const refreshMode = options.refreshMode ?? "auto";

    if (refreshMode === "hard") {
      await this.refreshScope(scope, "hard");
      scope.initialized = true;
    } else if (refreshMode === "light") {
      await this.refreshScope(scope, "light");
      scope.initialized = true;
    } else if (refreshMode === "auto" && !scope.initialized) {
      await this.refreshScope(scope, "hard");
      scope.initialized = true;
    } else {
      scope.initialized = true;
    }

    return this.filterViewRecords(this.getScopeRecords(scope), req);
  }

  private decryptAndAdaptRecords(
    records: CypherOwnedRecord[],
    account: RecordSyncAccount,
    chainId: string,
  ): RecordDetailWithSpent[] {
    const ownedRecords = this.getRecordsWithPlaintext(
      records,
      account,
      chainId,
    );
    const adaptedRecords: RecordDetailWithSpent[] = [];

    for (const record of ownedRecords) {
      try {
        adaptedRecords.push(ownedToRecordDetail(record));
      } catch (error) {
        console.error("[RecordSyncService] failed to adapt scanner record", {
          error,
          programName: record.programName,
          tag: record.tag,
        });
      }
    }

    return adaptedRecords;
  }

  private getRecordsWithPlaintext(
    records: CypherOwnedRecord[],
    account: RecordSyncAccount,
    chainId: string,
  ): OwnedRecord[] {
    let viewKey: ViewKey | undefined;
    const getViewKey = () => {
      viewKey ??= ViewKey.from_string(account.viewKey);
      return viewKey;
    };

    const recordsWithPlaintext: OwnedRecord[] = [];
    for (const record of records) {
      const cacheKey = this.plaintextCacheKey(chainId, account.address, record);
      let plaintext = cacheKey ? this.plaintextCache.get(cacheKey) : undefined;

      if (!plaintext && record.recordCiphertext) {
        plaintext = getViewKey().decrypt(record.recordCiphertext);
        if (cacheKey) {
          this.plaintextCache.set(cacheKey, plaintext);
        }
      }

      if (!plaintext) {
        console.warn("[RecordSyncService] scanner record has no plaintext", {
          commitment: record.commitment,
          programName: record.programName,
          tag: record.tag,
        });
        continue;
      }

      recordsWithPlaintext.push({
        ...record,
        recordPlaintext: plaintext,
      });
    }
    return recordsWithPlaintext;
  }

  private plaintextCacheKey(
    chainId: string,
    address: string,
    record: CypherOwnedRecord,
  ): string | undefined {
    const recordKey = record.tag || record.commitment;
    if (!recordKey) {
      return undefined;
    }
    return `${chainId}:${address}:${recordKey}`;
  }

  private resolveChainId(options: RecordSyncRequestOptions): string {
    return options.chainId ?? this.defaultChainId;
  }
}

export const recordSyncService = new RecordSyncService();
