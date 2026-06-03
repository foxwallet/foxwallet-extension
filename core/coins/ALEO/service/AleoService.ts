import { type AleoConfig } from "../types/AleoConfig";
import { type IAleoStorage } from "../types/IAleoStorage";
import { type FutureJSON, type RecordDetailWithSpent } from "../types/SyncTask";
import { parseU128, parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";
import {
  type InputItem,
  RecordFilter,
} from "@/scripts/background/servers/IWalletServer";
import { groupBy, uniqBy } from "lodash";
import { type AleoRpcService, createAleoRpcService } from "./instances/rpc";
import { type AleoCreditMethod } from "../types/TransferMethod";
import {
  type AleoLocalTxInfo,
  type AleoTransaction,
  AleoTxStatus,
} from "../types/Transaction";
import { type AleoGasFee } from "core/types/GasFee";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  ARCANE_PROGRAM_ID,
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
  COMPLIANCE_BALANCES_MAPPING_NAME,
  isComplianceProgram,
  LOCAL_TX_EXPIRE_TIME,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
  USAD_STABLECOIN_PROGRAM_ID,
  USDCX_STABLECOIN_PROGRAM_ID,
} from "../constants";
import {
  type AleoHistoryItem,
  AleoHistoryType,
  type AleoLocalHistoryItem,
  type AleoOnChainHistoryItem,
  AleoTxAddressType,
  AleoTxType,
} from "../types/History";
import {
  Address,
  BHP256,
  Plaintext,
  Program,
  RecordCiphertext,
  ViewKey,
} from "provable-wasm-no-tla/mainnet.js";
import {
  type AleoWalletService,
  createAleoWalletService,
} from "./instances/api";
import { type Pagination } from "../types/Pagination";
import { type FaucetMessage, type FaucetResp } from "../types/Faucet";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import {
  type AlphaSwapTokenService,
  createAlphaSwapTokenService,
} from "./instances/token";
import { type Token, type TokenWithBalance } from "../types/Token";
import { type InnerProgramId } from "../types/ProgramId";
import {
  BETA_STAKING_ALEO_TOKEN,
  USAD_TOKEN,
  USDCX_TOKEN,
} from "../config/chains";
import { isNotEmpty } from "core/utils/is";
import { recordSyncService, ScannerStorage } from "./scanner";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import { CoinServiceBasic } from "core/coins/CoinServiceBasic";
import { AssetType, TokenSecurity, type TokenV2 } from "core/types/Token";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type {
  InteractiveTokenParams,
  TokenTxHistoryParams,
} from "core/types/TokenTransaction";
import { type BalanceResp, type TokenBalanceParams } from "core/types/Balance";
import {
  type CoinTxDetailParams,
  type NativeCoinTxHistoryParams,
  type TransactionStatusInfo,
} from "core/types/NativeCoinTransaction";
import { type TransactionHistoryResp } from "core/types/TransactionHistory";
import { TransactionStatus } from "core/types/TransactionStatus";
import { AleoInfoApi } from "core/coins/ALEO/service/api/aleoInfoApi";
import { parseAleoFeeFuture } from "core/coins/ALEO/utils/utils";
import {
  type ArcaneService,
  createArcaneService,
} from "core/coins/ALEO/service/instances/arcane";
import { ProvableApi } from "core/coins/ALEO/service/api/provable";
import {
  type ComplianceService,
  createComplianceService,
} from "core/coins/ALEO/service/instances/compliance";

// Replacement for fox-aleo-sdk's `hashBHP256(struct: string)` helper, which
// the upstream @provablehq/wasm 0.10.x does not expose. Mirrors the
// reference project (provable-extension src/app/common/utils/tokenUtils.ts):
// hash a struct literal via BHP256 over the Plaintext's little-endian bits.
const hashBHP256 = (struct: string): string => {
  const hasher = new BHP256();
  const plaintext = Plaintext.fromString(struct);
  return hasher.hash(plaintext.toBitsLe()).toString();
};

const CREDITS_MAPPING_NAME = "account";

const ALPHA_SWAP_TOKEN_MAPPING_NAME = "tokens";

const ALEO_PRIVATE_BALANCE_CONSUMER_ID_PREFIX = "aleo:private-balance";

const ALEO_RECORDS_CONSUMER_ID_PREFIX = "aleo:records";

const ALEO_TOKEN_PRIVATE_BALANCE_CONSUMER_ID_PREFIX =
  "aleo:token-private-balance";

const normalizeAleoTimestampMs = (timestamp: number): number => {
  return timestamp >= 10_000_000_000 ? timestamp : timestamp * 1000;
};

type ScannerAccountCache = {
  address: string;
  chainId: string;
  uuid: string;
  viewKey: string;
};

type ScannerRecordsSnapshotRequest = {
  consumerId?: string;
  end?: number;
  programIds?: string[];
  purpose?: "default" | "view";
  recordFilter?: RecordFilter;
  refreshMode?: "auto" | "hard" | "light" | "none";
  requireRecords?: boolean;
  start?: number;
};

type ScannerRecordsSnapshot = {
  account: ScannerAccountCache;
  records: RecordDetailWithSpent[];
};

type ScannerRecordsMap = {
  [programId: string]: {
    [commitment: string]: RecordDetailWithSpent | undefined;
  };
};

// only for popup thread
export class AleoService extends CoinServiceBasic {
  config: AleoConfig;
  chainId: string;
  aleoInfoApi: AleoInfoApi;
  private aleoStorage: IAleoStorage;
  private rpcService: AleoRpcService;
  private provableApi: ProvableApi;
  private arcaneService: ArcaneService;
  private walletService: AleoWalletService;
  private tokenService: AlphaSwapTokenService;
  private complianceService: ComplianceService;
  private scannerAccountCache = new Map<string, ScannerAccountCache>();
  private scannerAccountPromiseCache = new Map<
    string,
    Promise<ScannerAccountCache>
  >();

  constructor(config: AleoConfig) {
    super(config);
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = AleoStorage.getInstance();
    this.aleoInfoApi = new AleoInfoApi(config.aleoInfoApi);
    this.rpcService = createAleoRpcService(
      config.rpcList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    );
    this.provableApi = new ProvableApi();
    this.complianceService = createComplianceService(this.chainId);
    this.walletService = createAleoWalletService(
      config.walletApiList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    );
    if (this.config.alphaSwapApi) {
      this.tokenService = createAlphaSwapTokenService([
        {
          url: this.config.alphaSwapApi,
          chainId: this.config.chainId,
        },
      ]);
    }
    if (this.config.arcaneApi) {
      this.arcaneService = createArcaneService([
        {
          url: this.config.arcaneApi,
          chainId: this.config.chainId,
        },
      ]);
    }
  }

  // validateAddress(address: string): boolean {
  //   try {
  //     const addressObj = Address.from_string(address);
  //     console.log("===> addressObj: ", addressObj, !!addressObj);
  //     return !!addressObj;
  //   } catch (err) {
  //     logger.log("===> isValidAddress failed: ", err, address);
  //     return false;
  //   }
  // }

  validateAddress(address: string): boolean {
    return /^aleo1[0-9a-z]{58}$/.test(address);
  }

  private scannerAccountCacheKey(address: string): string {
    return `${this.chainId}:${address}`;
  }

  private getPrivateBalanceConsumerId(address: string): string {
    return `${ALEO_PRIVATE_BALANCE_CONSUMER_ID_PREFIX}:${this.chainId}:${address}`;
  }

  private getRecordsConsumerId(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
  ): string {
    return `${ALEO_RECORDS_CONSUMER_ID_PREFIX}:${this.chainId}:${address}:${programId}:${recordFilter}`;
  }

  private getTokenPrivateBalanceConsumerId(
    address: string,
    programId: string,
    tokenId: string,
  ): string {
    return `${ALEO_TOKEN_PRIVATE_BALANCE_CONSUMER_ID_PREFIX}:${this.chainId}:${address}:${programId}:${tokenId}`;
  }

  private clearScannerAccountCache(address?: string): void {
    if (!address) {
      this.scannerAccountCache.clear();
      this.scannerAccountPromiseCache.clear();
      return;
    }
    const key = this.scannerAccountCacheKey(address);
    this.scannerAccountCache.delete(key);
    this.scannerAccountPromiseCache.delete(key);
  }

  private async loadScannerAccount(
    address: string,
  ): Promise<ScannerAccountCache> {
    const scannerStorage = ScannerStorage.getInstance();
    const [accountInfo, uuid] = await Promise.all([
      this.aleoStorage.getAccountInfo(address),
      scannerStorage.getScannerUuid(this.chainId, address),
    ]);
    const viewKey = accountInfo?.viewKey;
    if (!viewKey) {
      throw new Error("Aleo view key is required to read scanner records");
    }
    if (!uuid) {
      throw new Error("Scanner UUID is missing; call scannerRegister first");
    }
    return {
      address,
      chainId: this.chainId,
      uuid,
      viewKey,
    };
  }

  private async getScannerAccount(
    address: string,
    options: { forceReload?: boolean } = {},
  ): Promise<ScannerAccountCache> {
    const key = this.scannerAccountCacheKey(address);
    if (!options.forceReload) {
      const cached = this.scannerAccountCache.get(key);
      if (cached) {
        return cached;
      }
      const inFlight = this.scannerAccountPromiseCache.get(key);
      if (inFlight) {
        return await inFlight;
      }
    } else {
      this.clearScannerAccountCache(address);
    }

    const promise = this.loadScannerAccount(address);
    this.scannerAccountPromiseCache.set(key, promise);
    try {
      const account = await promise;
      this.scannerAccountCache.set(key, account);
      return account;
    } finally {
      this.scannerAccountPromiseCache.delete(key);
    }
  }

  private recordFilterToUnspent(
    recordFilter: RecordFilter,
  ): boolean | undefined {
    switch (recordFilter) {
      case RecordFilter.UNSPENT:
        return true;
      case RecordFilter.SPENT:
        return false;
      case RecordFilter.ALL:
        return undefined;
      default:
        return undefined;
    }
  }

  private parseScannerAmount(
    value: unknown,
    rawValue: string | undefined,
    parser: (value: string) => bigint,
  ): bigint {
    if (typeof value === "bigint") {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return BigInt(value);
    }
    if (typeof value === "string" && value.length > 0) {
      if (/^\d+$/.test(value)) {
        return BigInt(value);
      }
      return parser(value);
    }
    return rawValue ? parser(rawValue) : 0n;
  }

  private getRecordMicrocredits(record: RecordDetailWithSpent): bigint {
    return this.parseScannerAmount(
      record.parsedContent?.microcredits,
      typeof record.content.microcredits === "string"
        ? record.content.microcredits
        : undefined,
      parseU64,
    );
  }

  private getRecordTokenId(record: RecordDetailWithSpent): string | undefined {
    return typeof record.parsedContent?.token === "string"
      ? record.parsedContent.token
      : undefined;
  }

  private recordMatchesToken(
    record: RecordDetailWithSpent,
    tokenId?: string,
  ): boolean {
    switch (record.programId) {
      case ALPHA_TOKEN_PROGRAM_ID:
      case ARCANE_PROGRAM_ID:
        return (
          tokenId !== undefined && this.getRecordTokenId(record) === tokenId
        );
      default:
        return true;
    }
  }

  /**
   * Position of the recipient's output record in a transfer_private
   * transition's outputs array. The ABI is program-family dependent:
   *   credits.aleo        → recipient at index 0 (change at 1)
   *   token_registry / ARC-21 (alpha/arcane) → recipient at index 1
   *   compliance tokens (USAD/USDCx)         → recipient at index 2
   * Used to tell sender vs recipient apart when the local scanner only
   * surfaces one side of the transition.
   */
  private getRecipientOutputIndex(programId: string): number {
    if (programId === NATIVE_TOKEN_PROGRAM_ID) return 0;
    if (isComplianceProgram(programId)) return 2;
    return 1;
  }

  private getRecordAmountBigInt(
    record: RecordDetailWithSpent,
  ): bigint | undefined {
    const raw =
      record.parsedContent?.microcredits ?? record.parsedContent?.amount;
    if (raw === undefined || raw === null) return undefined;
    try {
      return typeof raw === "bigint" ? raw : BigInt(raw);
    } catch {
      return undefined;
    }
  }

  /**
   * Lazy IndexedDB-backed cache for full transaction bodies. Confirmed
   * Aleo transactions are immutable so cached entries never need
   * invalidation. Used by getPrivateTxHistory to compute private-transfer
   * amounts: we need the spent input record's `tag` (visible on the
   * transition input, even though the input itself is ciphertext) to look
   * up the local plaintext copy we scanned earlier.
   */
  private async getCachedTxDetail(
    txId: string,
  ): Promise<AleoTransaction | undefined> {
    try {
      const cached = await this.aleoStorage.getCachedTxDetail(
        this.chainId,
        txId,
      );
      if (cached) return cached;
    } catch (err) {
      console.warn("getCachedTxDetail read failed", err);
    }
    try {
      const item = await this.walletService.getTransaction(txId);
      const body = item.origin_data;
      if (!body) return undefined;
      // Best-effort: persist for next time. Don't fail the call if write fails.
      this.aleoStorage
        .setCachedTxDetail(this.chainId, txId, body)
        .catch((err) =>
          console.warn("setCachedTxDetail write failed", txId, err),
        );
      return body;
    } catch (err) {
      console.warn("getCachedTxDetail fetch failed", txId, err);
      return undefined;
    }
  }

  /**
   * Extracts the spent input record's tag from a transfer_private-style
   * transaction. Returns the first `type: "record"` input that carries a
   * `tag` field, since transfer-style functions consume exactly one record
   * (the rest are ciphertext / public scalars / addresses).
   */
  private findSpentInputTagInTx(
    tx: AleoTransaction,
    programId: string,
  ): string | undefined {
    const transitions = tx.execution?.transitions ?? [];
    // Walk transitions; pick the one matching this token's program. Fee
    // transitions are on credits.aleo and have their own record input, so
    // a naive `transitions[0]` would mis-grab the fee record for token
    // programs.
    for (const transition of transitions) {
      if (transition.program !== programId) continue;
      for (const input of transition.inputs ?? []) {
        if (input.type === "record" && input.tag) {
          return input.tag;
        }
      }
    }
    // Fallback: any transition's record input. Better than nothing for
    // non-standard programs.
    for (const transition of transitions) {
      for (const input of transition.inputs ?? []) {
        if (input.type === "record" && input.tag) {
          return input.tag;
        }
      }
    }
    return undefined;
  }

  private assertScannerRecordParsedContent(
    record: RecordDetailWithSpent,
  ): void {
    if (!record.parsedContent) {
      throw new Error(
        "Scanner record missing parsedContent for program " + record.programId,
      );
    }
  }

  private async getScannerRecordsForAccount(
    scannerAccount: ScannerAccountCache,
    request: ScannerRecordsSnapshotRequest = {},
  ): Promise<RecordDetailWithSpent[] | undefined> {
    const unspent = request.recordFilter
      ? this.recordFilterToUnspent(request.recordFilter)
      : undefined;
    const shouldApplyFilter =
      request.programIds !== undefined ||
      request.start !== undefined ||
      request.end !== undefined;
    const filter = shouldApplyFilter
      ? {
          ...(request.programIds ? { programs: request.programIds } : {}),
          ...(request.start !== undefined ? { start: request.start } : {}),
          ...(request.end !== undefined ? { end: request.end } : {}),
        }
      : undefined;

    return await recordSyncService.getDecryptedOwnedRecords(
      {
        uuid: scannerAccount.uuid,
        ...(filter ? { filter } : {}),
        ...(unspent !== undefined ? { unspent } : {}),
      },
      {
        address: scannerAccount.address,
        viewKey: scannerAccount.viewKey,
      },
      {
        chainId: this.chainId,
        consumerId: request.consumerId,
        purpose: request.purpose ?? "default",
        refreshMode: request.refreshMode ?? "auto",
      },
    );
  }

  private async getScannerRecordsSnapshot(
    address: string,
    request: ScannerRecordsSnapshotRequest = {},
  ): Promise<ScannerRecordsSnapshot> {
    const scannerAccount = await this.getScannerAccount(address);
    const records = await this.getScannerRecordsForAccount(
      scannerAccount,
      request,
    );
    if (records) {
      return { account: scannerAccount, records };
    }

    const refreshedAccount = await this.getScannerAccount(address, {
      forceReload: true,
    });
    if (refreshedAccount.uuid === scannerAccount.uuid) {
      if (request.requireRecords) {
        throw new Error("Get records failed");
      }
      return { account: refreshedAccount, records: [] };
    }

    const retryRecords = await this.getScannerRecordsForAccount(
      refreshedAccount,
      request,
    );
    if (!retryRecords && request.requireRecords) {
      throw new Error("Get records failed");
    }
    return { account: refreshedAccount, records: retryRecords ?? [] };
  }

  private buildScannerRecordsMap(
    records: RecordDetailWithSpent[],
  ): ScannerRecordsMap {
    return records.reduce<ScannerRecordsMap>((res, record) => {
      if (!res[record.programId]) {
        res[record.programId] = {};
      }
      res[record.programId]![record.commitment] = record;
      return res;
    }, {});
  }

  private async getScannerRecordsMap(
    address: string,
    request: ScannerRecordsSnapshotRequest = {},
  ): Promise<ScannerRecordsMap> {
    const { records } = await this.getScannerRecordsSnapshot(address, request);
    return this.buildScannerRecordsMap(records);
  }

  private async getScannerRecords(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
    consumerId?: string,
  ): Promise<RecordDetailWithSpent[]> {
    const viewConsumerId =
      consumerId ?? this.getRecordsConsumerId(address, programId, recordFilter);
    const { records } = await this.getScannerRecordsSnapshot(address, {
      consumerId: viewConsumerId,
      programIds: [programId],
      purpose: "view",
      recordFilter,
    });
    return records;
  }

  async getPrivateBalance(address: string): Promise<bigint> {
    const records = await this.getScannerRecords(
      address,
      this.config.nativeCurrency.address,
      RecordFilter.UNSPENT,
      this.getPrivateBalanceConsumerId(address),
    );
    return records.reduce((sum, record) => {
      if (record.spent) {
        return sum;
      }
      return sum + this.getRecordMicrocredits(record);
    }, 0n);
  }

  async getPublicBalance(address: string): Promise<bigint> {
    const balance = await this.provableApi.getPublicBalance(
      this.chainId,
      address,
    );
    if (!balance) {
      return 0n;
    }
    return parseU64(balance);
  }

  async getBalance(address: string) {
    const [privateRes, publicRes] = await Promise.allSettled([
      this.getPrivateBalance(address),
      this.getPublicBalance(address),
    ]);
    const privateBalance =
      privateRes.status === "fulfilled" ? privateRes.value : 0n;
    const publicBalance =
      publicRes.status === "fulfilled" ? publicRes.value : 0n;
    if (privateRes.status === "rejected") {
      logger.log("===> getPrivateBalance failed: ", privateRes.reason);
    }
    if (publicRes.status === "rejected") {
      logger.log("===> getPublicBalance failed: ", publicRes.reason);
    }

    return {
      privateBalance,
      publicBalance,
      total: privateBalance + publicBalance,
    };
  }

  async getBaseFee(
    programId: InnerProgramId,
    method: AleoCreditMethod,
  ): Promise<bigint> {
    const baseFee = await this.walletService.getBaseFee({
      txType: method,
      programId,
    });
    return baseFee;
  }

  private getPriorityFeeInTx(tx: AleoTransaction) {
    const fee = tx.fee;
    if (fee) {
      const inputs = fee?.transition?.inputs;
      if (inputs) {
        const value = inputs[1].value;
        if (value) {
          return parseU64(value);
        }
      }
    }
    return undefined;
  }

  async getPriorityFee(): Promise<bigint> {
    try {
      const priorityFee = await this.walletService.getPriorityFee();
      if (priorityFee) {
        return BigInt(priorityFee);
      }
      const [latestBlock] = await Promise.all([
        this.rpcService.getLatestBlock(),
      ]);
      const feeList: bigint[] = [];
      latestBlock.transactions?.forEach((tx) => {
        const fee = this.getPriorityFeeInTx(tx.transaction);
        if (fee) {
          feeList.push(fee);
        }
      });
      if (feeList.length === 0) {
        return 100000n;
      }
      feeList.sort((fee1, fee2) => Number(fee1 - fee2));
      return feeList[Math.floor(feeList.length / 2)];
    } catch (err) {
      console.error("===> getPriorityFee error: ", err);
      return 100000n;
    }
  }

  async getGasFee(
    programId: InnerProgramId,
    method: AleoCreditMethod,
  ): Promise<AleoGasFee> {
    const [baseFee, priorityFee] = await Promise.all([
      this.getBaseFee(programId, method),
      this.getPriorityFee(),
    ]);

    return {
      baseFee,
      priorityFee,
    };
  }

  parseProgram = (programStr: string): Program => {
    try {
      const program = Program.fromString(programStr);
      return program;
    } catch (err) {
      throw new Error("Invalid program " + programStr);
    }
  };

  private parseViewKey = (viewKeyStr: string): ViewKey => {
    try {
      const viewKey = ViewKey.from_string(viewKeyStr);
      return viewKey;
    } catch (err) {
      throw new Error("Invalid view key");
    }
  };

  private parseFuture = (_futureStr?: string): FutureJSON | undefined => {
    // FoxFuture was a fox-aleo-sdk extension to wasm-pack output that the
    // upstream @provablehq/wasm 0.10.x does not provide, and there is no
    // drop-in replacement (Future is consumed inside the SDK's Transaction
    // pipeline rather than exported as a standalone parser). History views
    // that depended on this currently degrade to undefined; private balance
    // and the scanner decrypt path do not depend on it.
    // TODO: reimplement using either a hand-rolled future literal parser or
    // a future helper added to fox-aleo-sdk.
    return undefined;
  };

  private parseRecordCiphertext = (recordCiphertextStr: string) => {
    try {
      return RecordCiphertext.fromString(recordCiphertextStr);
    } catch (err) {
      console.error("===> parseRecordCiphertext error: ", err);
      return undefined;
    }
  };

  private isRecordOwner(viewKey: ViewKey, ciphertext: string): boolean {
    try {
      const record = this.parseRecordCiphertext(ciphertext);
      if (!record) {
        return false;
      }
      const newViewKey = viewKey.clone();
      const isOwner = record.isOwner(newViewKey);
      return isOwner;
    } catch (err) {
      console.error("==> record decrypt error: ", err);
    }
    return false;
  }

  async getProgramContent(chainId: string, programId: string) {
    const cache = await this.aleoStorage.getProgramContent(chainId, programId);
    console.log("===> getProgramContent cache: ", cache?.length);
    if (cache) {
      return cache;
    }
    const program = await this.rpcService.getProgram(programId);
    console.log("===> getProgramContent: ", program.length);
    if (program) {
      await this.aleoStorage.setProgramContent(chainId, programId, program);
    }
    return program;
  }

  async getProgram(
    chainId: string,
    programId: string,
  ): Promise<Program | null> {
    const programStr = await this.getProgramContent(chainId, programId);
    if (programStr) {
      return this.parseProgram(programStr);
    }
    return null;
  }

  private async getRecordsWithName(
    programId: string,
    records: { [commitment in string]?: RecordDetailWithSpent },
  ) {
    let program: Program | null = null;
    let changed = false;

    for (const [commitment, record] of Object.entries(records)) {
      try {
        if (!record) {
          continue;
        }
        if (!record.recordName) {
          if (!program) {
            program = await this.getProgram(this.chainId, programId);
            if (!program) {
              throw new Error("Can't get program " + programId);
            }
          }
          const recordName = program.matchRecordPlaintext(record.plaintext);
          record.recordName = recordName;
          changed = true;
        }
      } catch (err) {
        console.error("===> getRecordsWithName error: ", err);
      } finally {
        records[commitment] = record;
      }
    }
    return { records, changed };
  }

  async getRecords(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
    withRecordName?: boolean,
    consumerId?: string,
  ): Promise<RecordDetailWithSpent[]> {
    let records = await this.getScannerRecords(
      address,
      programId,
      recordFilter,
      consumerId,
    );
    if (withRecordName) {
      const recordsMap = records.reduce<{
        [commitment in string]?: RecordDetailWithSpent;
      }>((res, record) => {
        res[record.commitment] = record;
        return res;
      }, {});
      const { records: recordWithName } = await this.getRecordsWithName(
        programId,
        recordsMap,
      );
      records = Object.values(recordWithName).filter(isNotEmpty);
    }

    records = records.filter((item) => {
      switch (recordFilter) {
        case RecordFilter.SPENT: {
          return item.spent;
        }
        case RecordFilter.UNSPENT: {
          return !item.spent;
        }
        case RecordFilter.ALL: {
          return true;
        }
        default:
          return false;
      }
    });
    if (programId !== NATIVE_TOKEN_PROGRAM_ID) {
      return records;
    } else {
      return records
        .map((record) => {
          return {
            ...record,
            parsedContent: {
              ...(record.parsedContent ?? {}),
              microcredits: this.getRecordMicrocredits(record),
            },
          };
        })
        .sort((record1, record2) => {
          return Number(
            record2.parsedContent.microcredits -
              record1.parsedContent.microcredits,
          );
        });
    }
  }

  private async processLocalTxInfo(
    address: string,
    txInfo?: AleoLocalTxInfo | null,
    program?: string,
    tokenId?: string,
  ) {
    let result: AleoLocalHistoryItem | null = null;
    if (!txInfo) {
      return null;
    }
    if (program && txInfo.programId !== program) {
      return null;
    }
    if (tokenId && txInfo.tokenId !== tokenId) {
      return null;
    }
    switch (txInfo.status) {
      case AleoTxStatus.QUEUED:
      case AleoTxStatus.GENERATING_PROVER_FILES:
      case AleoTxStatus.GENERATING_TRANSACTION:
      case AleoTxStatus.BROADCASTING: {
        result = {
          type: AleoHistoryType.LOCAL,
          localId: txInfo.localId,
          status: txInfo.status,
          programId: txInfo.programId,
          functionName: txInfo.functionName,
          inputs: txInfo.inputs,
          timestamp: txInfo.timestamp,
          addressType: AleoTxAddressType.SEND,
          amount: txInfo.amount,
          txType: txInfo.txType || AleoTxType.EXECUTION,
          notification: txInfo.notification,
          tokenId: txInfo.tokenId,
        };
        break;
      }
      case AleoTxStatus.COMPLETED: {
        const txId = txInfo.transaction?.id;
        try {
          if (!txId) {
            console.error("===> Completed txId is null: ", txInfo);
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: txInfo.status,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txType: txInfo.txType || AleoTxType.EXECUTION,
              notification: txInfo.notification,
              tokenId: txInfo.tokenId,
            };
            break;
          }
          const tx = await this.getTxInfoOnChain(txId);
          if (!tx) {
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: txInfo.status,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txType: txInfo.txType || AleoTxType.EXECUTION,
              txId,
              notification: txInfo.notification,
              tokenId: txInfo.tokenId,
            };
          } else {
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: AleoTxStatus.FINALIZD,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txType: txInfo.txType || AleoTxType.EXECUTION,
              txId,
              notification: txInfo.notification,
              tokenId: txInfo.tokenId,
            };
            const newTxInfo = {
              ...txInfo,
              status: AleoTxStatus.FINALIZD,
            };
            await this.aleoStorage.setAddressLocalTx(
              this.chainId,
              address,
              newTxInfo,
            );
          }
        } catch (err) {
          console.error("===> Completed tx error: ", err);
          const now = Date.now();
          const timestamp = txInfo.timestamp;
          if (now - timestamp >= LOCAL_TX_EXPIRE_TIME) {
            const errorMsg = "Transaction expired";
            await this.aleoStorage.setAddressLocalTx(this.chainId, address, {
              ...txInfo,
              error: errorMsg,
              status: AleoTxStatus.UNACCEPTED,
            });
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: AleoTxStatus.UNACCEPTED,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              error: errorMsg,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txType: txInfo.txType || AleoTxType.EXECUTION,
              txId,
              notification: txInfo.notification,
              tokenId: txInfo.tokenId,
            };
          } else {
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: txInfo.status,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txType: txInfo.txType || AleoTxType.EXECUTION,
              txId,
              notification: txInfo.notification,
              tokenId: txInfo.tokenId,
            };
          }
        }
        break;
      }
      case AleoTxStatus.UNACCEPTED:
      case AleoTxStatus.FAILED:
      case AleoTxStatus.REJECTED: {
        result = {
          type: AleoHistoryType.LOCAL,
          localId: txInfo.localId,
          status: txInfo.status,
          programId: txInfo.programId,
          functionName: txInfo.functionName,
          inputs: txInfo.inputs,
          error: txInfo.error,
          timestamp: txInfo.timestamp,
          addressType: AleoTxAddressType.SEND,
          amount: txInfo.amount,
          txId: txInfo.transaction?.id,
          txType: txInfo.txType || AleoTxType.EXECUTION,
          notification: txInfo.notification,
          tokenId: txInfo.tokenId,
        };
        break;
      }
      case AleoTxStatus.FINALIZD: {
        result = {
          type: AleoHistoryType.LOCAL,
          localId: txInfo.localId,
          txId: txInfo.transaction?.id,
          status: txInfo.status,
          programId: txInfo.programId,
          functionName: txInfo.functionName,
          inputs: txInfo.inputs,
          timestamp: txInfo.timestamp,
          addressType: AleoTxAddressType.SEND,
          amount: txInfo.amount,
          txType: txInfo.txType || AleoTxType.EXECUTION,
          notification: txInfo.notification,
          tokenId: txInfo.tokenId,
        };
        break;
      }
    }
    return result;
  }

  async getLocalTxHistory(
    address: string,
    program?: string,
    tokenId?: string,
  ): Promise<AleoLocalHistoryItem[]> {
    const localTxs = await this.aleoStorage.getAddressLocalTxs(
      this.chainId,
      address,
    );

    const txs = await Promise.all(
      localTxs.map(async (item) => {
        return await this.processLocalTxInfo(
          address,
          item,
          program,
          tokenId ?? NATIVE_TOKEN_TOKEN_ID,
        );
      }),
    );
    return txs.filter((item) => !!item) as AleoLocalHistoryItem[];
  }

  async getLocalTxInfo(
    address: string,
    localId: string,
    program?: string,
  ): Promise<AleoLocalHistoryItem | null> {
    const txInfo = await this.aleoStorage.getAddressLocalTx(
      this.chainId,
      address,
      localId,
    );
    return await this.processLocalTxInfo(address, txInfo, program);
  }

  async setLocalTxNotification(localId: string) {
    await this.aleoStorage.setLocalTxNotification(this.chainId, localId);
  }

  async getPublicTxHistory({
    address,
    pagination,
  }: {
    address: string;
    pagination: Pagination;
  }): Promise<AleoOnChainHistoryItem[]> {
    // TODO: wait for public history api ready
    return [];

    // const { cursor } = pagination;
    // const publicHistory = await this.walletService
    //
    //   .getPublicHistory(address, cursor);
    // return publicHistory.map((item) => {
    //   return {
    //     type: AleoHistoryType.ON_CHAIN,
    //     txId: item.transactionId,
    //     programId: item.executionProgram,
    //     functionName: item.executionFunction,
    //     height: item.blockHeight,
    //     timestamp: item.blockTime,
    //     addressType: AleoTxAddressType.SEND,
    //     amount: !!item.executionValue
    //       ? parseU64(item.executionValue).toString()
    //       : undefined,
    //     txType: AleoTxType.EXECUTION, // TODO: split EXECUTION and DEPLOYMENT
    //     status: AleoTxStatus.FINALIZD,
    //   };
    // });
  }

  private async getTxInfoOnChain(txId: string): Promise<AleoTransaction> {
    return await this.rpcService.getTransaction(txId);
  }

  private async getConfirmedTransactionInfo({
    txId,
    viewKey,
    address,
  }: {
    txId: string;
    viewKey: ViewKey;
    address: string;
  }) {
    const cachedTx = await this.aleoStorage.getCachedTransaction(
      this.chainId,
      txId,
    );
    if (cachedTx) {
      return cachedTx;
    }
    const item = await this.walletService.getTransaction(txId);
    let txType = AleoTxType.EXECUTION;
    if (item.origin_data.deployment) {
      txType = AleoTxType.DEPLOYMENT;
    }
    const isRejected =
      !item.origin_data.deployment && !item.origin_data.execution;
    let programId = "";
    let funcName = "";
    if (item.origin_data.execution?.transitions) {
      const transitions = item.origin_data.execution.transitions;
      const lastTransition = transitions[transitions.length - 1];
      programId = lastTransition.program;
      funcName = lastTransition.function;
    } else if (item.origin_data.deployment.program) {
      const program = item.origin_data.deployment.program;
      const programObj = this.parseProgram(program);
      programId = programObj.id();
    }
    const feeTransition = item.origin_data.fee?.transition;
    let fee = 0n;
    let isSender = false;
    if (feeTransition) {
      switch (feeTransition.function) {
        case "fee_public": {
          const output = feeTransition.outputs?.[0];
          if (!output || output.type !== "future") {
            return undefined;
          }
          const futureObj = this.parseFuture(output.value);
          if (!futureObj) {
            return undefined;
          }
          // 当前地址付 fee
          if (futureObj.arguments && futureObj.arguments[0] === address) {
            fee = parseU64(futureObj.arguments[1]);
            isSender = true;
          }
          break;
        }
        case "fee_private": {
          const outputs = feeTransition.outputs;
          if (!outputs?.[0]) {
            return undefined;
          }
          const output = outputs[0];
          if (output.type === "record") {
            const isOwner = this.isRecordOwner(viewKey, output.value);
            if (isOwner) {
              isSender = true;
              const baseFee = parseU64(feeTransition.inputs?.[1].value ?? "");
              const priorityFee = parseU64(
                feeTransition.inputs?.[2].value ?? "",
              );
              fee = baseFee + priorityFee;
            }
          }
          break;
        }
      }
    }

    const history: AleoOnChainHistoryItem = {
      type: AleoHistoryType.ON_CHAIN,
      txId: item.origin_data.id,
      programId,
      functionName: funcName,
      height: item.height,
      timestamp: normalizeAleoTimestampMs(item.timestamp),
      addressType: isSender
        ? AleoTxAddressType.SEND
        : AleoTxAddressType.RECEIVE,
      status: AleoTxStatus.FINALIZD,
      txType,
    };
    await this.aleoStorage.cacheTransaction(this.chainId, history);
    return history;
  }

  async getPrivateTxHistory(
    address: string,
    program?: string,
    tokenId?: string,
  ) {
    let records: RecordDetailWithSpent[] = [];
    const recordsMap = await this.getScannerRecordsMap(address, {
      ...(program ? { programIds: [program] } : {}),
      recordFilter: RecordFilter.ALL,
    });
    if (program) {
      records = Object.values(recordsMap[program] ?? {})
        .filter(isNotEmpty)
        .filter((record) => this.recordMatchesToken(record, tokenId));
    } else {
      const programs = Object.keys(recordsMap);
      for (const program of programs) {
        const res = Object.values(recordsMap[program] ?? {}).filter(isNotEmpty);
        records = records.concat(res);
      }
    }

    const groupRecords = groupBy(records, (item) => item.transactionId);

    // Flat tag→record lookup across every owned record we just pulled,
    // regardless of which tx group they belong to. Needed for the
    // private-transfer sender amount calculation: the spent input record
    // lives in the tx that CREATED it (e.g. an earlier
    // transfer_public_to_private), but its tag is referenced by the tx
    // that consumed it. Mirrors the `recordsLookup.find(r => r.tag === ...)`
    // pattern in provable-extension's parseSentPrivateTransaction.
    const tagToRecord = new Map<string, RecordDetailWithSpent>();
    for (const r of records) {
      if (r.tag) tagToRecord.set(r.tag, r);
    }

    const transactionIds = Object.keys(groupRecords);
    transactionIds.sort((txId1, txId2) => {
      const records1 = groupRecords[txId1];
      const records2 = groupRecords[txId2];
      return records2[0].height - records1[0].height;
    });

    // Async per-tx work (potential getCachedTxDetail fetch for senders) is
    // gated by IndexedDB cache, so the network hit only happens once per
    // tx across all sessions.
    return await Promise.all(
      transactionIds.map(async (txId) => {
        const txRecords = groupRecords[txId];
        const executionRecords: RecordDetailWithSpent[] = [];
        const feeRecords: RecordDetailWithSpent[] = [];
        let height = 0;
        for (const record of txRecords) {
          height = record.height;
          record.timestamp = normalizeAleoTimestampMs(record.timestamp);
          if (
            record.programId === NATIVE_TOKEN_PROGRAM_ID &&
            record.functionName.startsWith("fee")
          ) {
            feeRecords.push(record);
          } else {
            executionRecords.push(record);
          }
        }

        const amount = await this.resolvePrivateTxAmount({
          txId,
          executionRecords,
          tagToRecord,
        });
        const addressType = await this.resolvePrivateTxAddressType({
          txId,
          executionRecords,
          feeRecords,
          tagToRecord,
        });

        return {
          txId,
          height,
          executionRecords,
          feeRecords,
          amount,
          addressType,
        };
      }),
    );
  }

  private async resolvePrivateTxAddressType({
    txId,
    executionRecords,
    feeRecords,
    tagToRecord,
  }: {
    txId: string;
    executionRecords: RecordDetailWithSpent[];
    feeRecords: RecordDetailWithSpent[];
    tagToRecord: Map<string, RecordDetailWithSpent>;
  }): Promise<AleoTxAddressType> {
    if (executionRecords.length === 0) return AleoTxAddressType.SEND;

    const primary = executionRecords[0];
    const fn = primary.functionName;
    const programId = primary.programId;

    if (feeRecords.length > 0) {
      return AleoTxAddressType.SEND;
    }

    if (fn === "transfer_private" || fn === "transfer_private_to_public") {
      const tx = await this.getCachedTxDetail(txId);
      const inputTag = tx ? this.findSpentInputTagInTx(tx, programId) : "";
      if (inputTag && tagToRecord.has(inputTag)) {
        return AleoTxAddressType.SEND;
      }

      if (fn === "transfer_private") {
        const recipientIdx = this.getRecipientOutputIndex(programId);
        const onlyRecipientOutput =
          executionRecords.length === 1 &&
          !executionRecords[0].spent &&
          executionRecords[0].outputIndex === recipientIdx;
        if (onlyRecipientOutput) {
          return AleoTxAddressType.RECEIVE;
        }
      }

      return AleoTxAddressType.SEND;
    }

    if (
      fn === "transfer_public_to_private" ||
      fn === "mint" ||
      fn === "mint_private"
    ) {
      return AleoTxAddressType.RECEIVE;
    }

    return AleoTxAddressType.SEND;
  }

  /**
   * Best-effort: derive the on-history-row amount for one private transaction
   * given the records the local scanner owns from it.
   *
   * - transfer_private (sender): change record (unspent, our owner) is
   *   visible here; the spent input record lives in another tx group (the
   *   tx that produced it) — looked up by tag. amount = input − change.
   * - transfer_private (recipient): only the new output (our owner,
   *   unspent) is in this group. amount = that record.
   * - transfer_private_to_public (sender): spent input lives in another
   *   group; we may or may not see a change record here. Fetch the tx and
   *   look up the spent input via tag → amount = input − any local change.
   * - transfer_public_to_private (recipient): only the unspent output is
   *   in this group. amount = that record.
   * - join / split: keep the "max record in the group" heuristic (handled
   *   by the caller in useTxHistory for now since we don't surface joinData
   *   here yet).
   *
   * Returns `undefined` when we genuinely can't tell (caller falls back to
   * "---" in the UI).
   */
  private async resolvePrivateTxAmount({
    txId,
    executionRecords,
    tagToRecord,
  }: {
    txId: string;
    executionRecords: RecordDetailWithSpent[];
    tagToRecord: Map<string, RecordDetailWithSpent>;
  }): Promise<string | undefined> {
    if (executionRecords.length === 0) return undefined;
    const primary = executionRecords[0];
    const fn = primary.functionName;
    const programId = primary.programId;

    if (fn === "transfer_public_to_private" || fn === "mint") {
      // Recipient view: a public->private transfer or a `mint` (e.g.
      // puzzle_arcade_coin_v002.aleo::mint) produces a new private record
      // owned by us with no spent input. amount = that record's value.
      const recvRecord = executionRecords.find((r) => !r.spent) ?? primary;
      const amt = this.getRecordAmountBigInt(recvRecord);
      return amt !== undefined ? amt.toString() : undefined;
    }

    if (fn === "transfer_private" || fn === "transfer_private_to_public") {
      const recipientIdx = this.getRecipientOutputIndex(programId);
      // We're the recipient of transfer_private when the only record we
      // own in this tx group sits at the recipient output index.
      const looksLikeRecipient =
        fn === "transfer_private" &&
        executionRecords.length === 1 &&
        !executionRecords[0].spent &&
        executionRecords[0].outputIndex === recipientIdx;
      if (looksLikeRecipient) {
        const amt = this.getRecordAmountBigInt(executionRecords[0]);
        return amt !== undefined ? amt.toString() : undefined;
      }

      // Otherwise treat as sender: find the spent input record by tag from
      // the on-chain tx body, then compute amount = inputTotal − changeTotal.
      const tx = await this.getCachedTxDetail(txId);
      if (!tx) return undefined;
      const inputTag = this.findSpentInputTagInTx(tx, programId);
      if (!inputTag) return undefined;
      const inputRecord = tagToRecord.get(inputTag);
      if (!inputRecord) return undefined;
      const inputAmount = this.getRecordAmountBigInt(inputRecord);
      if (inputAmount === undefined) return undefined;

      // Sum any owned outputs that are NOT the input itself (the change
      // record for transfer_private; potentially zero records for
      // transfer_private_to_public where the output is public).
      let ownedOutputs = 0n;
      for (const r of executionRecords) {
        if (r.tag === inputTag) continue;
        const v = this.getRecordAmountBigInt(r);
        if (v !== undefined) ownedOutputs += v;
      }
      const diff = inputAmount - ownedOutputs;
      return diff >= 0n ? diff.toString() : inputAmount.toString();
    }

    return undefined;
  }

  async getTxHistory(
    address: string,
    pagination: Pagination,
    program?: string,
  ): Promise<AleoHistoryItem[]> {
    const [publicHistory, localTxList] = await Promise.all([
      this.getPublicTxHistory({ address, pagination }),
      this.getLocalTxHistory(address, program),
    ]);
    const lastHeight = pagination.cursor
      ? parseInt(pagination.cursor)
      : undefined;
    const startHeight = publicHistory[publicHistory.length - 1]?.height;
    let privateHistory: AleoHistoryItem[] = [];
    const { account, records } = await this.getScannerRecordsSnapshot(address, {
      end: lastHeight,
      recordFilter: RecordFilter.ALL,
      start: startHeight,
    });
    const viewKeyObj = this.parseViewKey(account.viewKey);
    const recordsInRange = records.filter((item) => {
      // record occurred in public history
      if (
        publicHistory.some((history) => history.txId === item.transactionId)
      ) {
        return false;
      }
      // record occured in local history
      if (localTxList.some((history) => history.txId === item.transactionId)) {
        return false;
      }
      return true;
    });
    const recordTxIds = new Set<string>();
    recordsInRange.forEach((item) => {
      recordTxIds.add(item.transactionId);
    });
    const privateTxs = await Promise.all(
      [...recordTxIds].map(async (item) => {
        const tx = await this.getConfirmedTransactionInfo({
          txId: item,
          viewKey: viewKeyObj,
          address,
        });
        return tx;
      }),
    );
    privateHistory = privateTxs.filter((item) => !!item) as AleoHistoryItem[];

    const otherTxList = [];
    const finishedLocalTxList = [];
    for (const tx of localTxList) {
      switch (tx.status) {
        case AleoTxStatus.QUEUED:
        case AleoTxStatus.GENERATING_PROVER_FILES:
        case AleoTxStatus.GENERATING_TRANSACTION:
        case AleoTxStatus.BROADCASTING:
        case AleoTxStatus.REJECTED:
        case AleoTxStatus.UNACCEPTED:
        case AleoTxStatus.FAILED: {
          otherTxList.push(tx);
          break;
        }
        case AleoTxStatus.COMPLETED:
        case AleoTxStatus.FINALIZD: {
          finishedLocalTxList.push(tx);
          break;
        }
      }
    }
    const txList = uniqBy(
      [...finishedLocalTxList, ...publicHistory, ...privateHistory],
      (item) => item.txId,
    );
    const historyList = [...txList, ...otherTxList];
    historyList.sort((item1, item2) => {
      if (
        (item1 as AleoOnChainHistoryItem).height &&
        (item2 as AleoOnChainHistoryItem).height
      ) {
        return (
          (item2 as AleoOnChainHistoryItem).height -
          (item1 as AleoOnChainHistoryItem).height
        );
      }
      return item2.timestamp - item1.timestamp;
    });

    return historyList;
  }

  async setAddressLocalTx(address: string, info: AleoLocalTxInfo) {
    await this.aleoStorage.setAddressLocalTx(this.chainId, address, info);
  }

  async removeAddressLocalTx(address: string, localId: string) {
    await this.aleoStorage.removeAddressLocalTx(this.chainId, address, localId);
  }

  async clearAddressLocalData(adderss: string) {
    this.clearScannerAccountCache(adderss);
    await this.aleoStorage.clearAddressLocalData(this.chainId, adderss);
    recordSyncService.resetAddress(this.chainId, adderss);
  }

  async resetChainData() {
    this.clearScannerAccountCache();
    await this.aleoStorage.reset(this.chainId);
    recordSyncService.resetChain(this.chainId);
  }

  async faucetMessage(address: string): Promise<FaucetMessage> {
    const content = await this.walletService.getFaucetContent({ address });
    const message = {
      ...content,
      address,
      timestamp: Date.now().toString(),
    };
    const messageDisplay = Object.values(message).reduce((res, value) => {
      if (!res) {
        return value;
      }
      return `${res}\n${value}`;
    }, "");

    return {
      rawMessage: JSON.stringify(message),
      displayMessage: messageDisplay,
    };
  }

  async faucetStatus(address: string): Promise<FaucetResp> {
    const status = await this.walletService.getFaucetStatus({ address });
    return status;
  }

  async requestFaucet({
    address,
    message,
    signature,
  }: {
    address: string;
    message: string;
    signature: string;
  }): Promise<boolean> {
    const res = await this.walletService.requestFaucet({
      address,
      message,
      signature,
    });
    return !!res;
  }

  getTxDetailUrl(txId: string, lang?: ExplorerLanguages): string | undefined {
    if (!this.config.explorerUrls || !this.config.explorerPaths?.tx) {
      return undefined;
    }
    return new URL(
      this.config.explorerPaths.tx.replace("{txid}", txId),
      this.config.explorerUrls[lang ?? ExplorerLanguages.EN],
    ).href;
  }

  formatRequestTransactionInputsAndFee = async (
    address: string,
    inputs: InputItem[],
    fee: bigint,
  ) => {
    const recordsMap = await this.getScannerRecordsMap(address, {
      recordFilter: RecordFilter.ALL,
      requireRecords: true,
    });

    const usedCreditRecords: RecordDetailWithSpent[] = [];
    const newInputs = inputs.map(async (item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item instanceof Array) {
        return `[${item.join(",")}]`;
      }
      if (item.id && item.owner && item.program_id) {
        const records = recordsMap[item.program_id] ?? {};
        const existRecord = records[item.id];
        if (existRecord && existRecord.plaintext) {
          if (item.program_id === NATIVE_TOKEN_PROGRAM_ID) {
            usedCreditRecords.push(existRecord);
          }
          return existRecord.plaintext;
        }
      }
      throw new Error(`Invalid input item: ${JSON.stringify(item)}`);
    });
    const creditsRecords = Object.values(
      recordsMap[NATIVE_TOKEN_PROGRAM_ID] ?? {},
    ).filter((item) => {
      if (!item) {
        return false;
      }
      return !item.spent;
    }) as RecordDetailWithSpent[];
    const formatCreditsRecords = creditsRecords
      .map((record) => {
        return {
          ...record,
          parsedContent: {
            ...(record.parsedContent ?? {}),
            microcredits: this.getRecordMicrocredits(record),
          },
        };
      })
      .sort((record1, record2) => {
        return Number(
          record2.parsedContent.microcredits -
            record1.parsedContent.microcredits,
        );
      });
    let feeRecord: RecordDetailWithSpent | null = null;
    for (const record of formatCreditsRecords) {
      if (!record) {
        continue;
      }
      if (record.spent) {
        continue;
      }
      if (
        usedCreditRecords.some((item) => item.commitment === record.commitment)
      ) {
        continue;
      }
      if (BigInt(record.parsedContent?.microcredits || 0) >= fee) {
        feeRecord = record;
        break;
      }
    }
    return {
      formatInputs: await Promise.all(newInputs),
      feeRecord,
    };
  };

  // tokens
  supportToken(): boolean {
    return !!this.config.alphaSwapApi;
  }

  async getTokenPublicBalance(
    address: string,
    programId: InnerProgramId,
    tokenId: string,
  ) {
    if (isComplianceProgram(programId)) {
      const balance = await this.rpcService.getProgramMappingValue(
        programId,
        COMPLIANCE_BALANCES_MAPPING_NAME,
        address,
      );
      if (!balance || balance === "null") {
        return 0n;
      }
      return parseU128(balance);
    }
    switch (programId) {
      case ALPHA_TOKEN_PROGRAM_ID: {
        const id = hashBHP256(`{ token: ${tokenId}, user: ${address} }`);
        console.log("===> public balance id: ", tokenId, address, id);
        const balance = await this.rpcService.getProgramMappingValue(
          programId,
          CREDITS_MAPPING_NAME,
          id,
        );
        console.log("===> token public balance: ", balance, id);
        if (!balance || balance === "null") {
          return 0n;
        }
        return parseU128(balance);
      }
      case BETA_STAKING_PROGRAM_ID: {
        const balance = await this.rpcService.getProgramMappingValue(
          programId,
          CREDITS_MAPPING_NAME,
          address,
        );
        console.log("===> token public balance: ", balance, address);
        if (!balance || balance === "null") {
          return 0n;
        }
        return parseU64(balance);
      }
      case ARCANE_PROGRAM_ID: {
        const id = hashBHP256(`{account: ${address}, token_id: ${tokenId}}`);
        const res = await this.rpcService.getProgramMappingValue(
          programId,
          "authorized_balances",
          id,
        );
        if (!res || typeof res !== "string" || res === "null") {
          return 0n;
        }
        const match = res.match(/balance:\s*(\d+)u128?/);
        const balance = match?.[1];
        if (!balance) {
          return 0n;
        } else {
          return BigInt(balance);
        }
      }
      default: {
        throw new Error("Unsupported program id " + programId);
      }
    }
  }

  async getTokenPrivateBalance(
    address: string,
    programId: InnerProgramId,
    tokenId: string,
  ) {
    if (isComplianceProgram(programId)) {
      const result = await this.getRecords(
        address,
        programId,
        RecordFilter.UNSPENT,
        undefined,
        this.getTokenPrivateBalanceConsumerId(address, programId, tokenId),
      );
      return result.reduce((sum, record) => {
        this.assertScannerRecordParsedContent(record);
        return sum + BigInt(record.parsedContent.amount);
      }, 0n);
    }
    switch (programId) {
      case ALPHA_TOKEN_PROGRAM_ID: {
        const result = await this.getRecords(
          address,
          ALPHA_TOKEN_PROGRAM_ID,
          RecordFilter.UNSPENT,
          undefined,
          this.getTokenPrivateBalanceConsumerId(
            address,
            ALPHA_TOKEN_PROGRAM_ID,
            tokenId,
          ),
        );
        return result.reduce((sum, record) => {
          this.assertScannerRecordParsedContent(record);
          if (this.getRecordTokenId(record) !== tokenId) {
            return sum;
          }
          return sum + BigInt(record.parsedContent.amount);
        }, 0n);
      }
      case BETA_STAKING_PROGRAM_ID: {
        const result = await this.getRecords(
          address,
          BETA_STAKING_PROGRAM_ID,
          RecordFilter.UNSPENT,
          undefined,
          this.getTokenPrivateBalanceConsumerId(
            address,
            BETA_STAKING_PROGRAM_ID,
            tokenId,
          ),
        );

        if (!result) {
          return 0n;
        }

        return result.reduce((sum, record) => {
          this.assertScannerRecordParsedContent(record);
          return sum + BigInt(record.parsedContent.amount);
        }, 0n);
      }
      case ARCANE_PROGRAM_ID: {
        const result = await this.getRecords(
          address,
          ARCANE_PROGRAM_ID,
          RecordFilter.UNSPENT,
          undefined,
          this.getTokenPrivateBalanceConsumerId(
            address,
            ARCANE_PROGRAM_ID,
            tokenId,
          ),
        );
        return result.reduce((sum, record) => {
          this.assertScannerRecordParsedContent(record);
          if (this.getRecordTokenId(record) !== tokenId) {
            return sum;
          }
          return sum + BigInt(record.parsedContent.amount);
        }, 0n);
      }
      default: {
        throw new Error("Unsupported program id " + programId);
      }
    }
  }

  // TODO impl new api
  async getComplianceProof(
    programId: string,
    address: string,
  ): Promise<string> {
    return await this.complianceService.getComplianceProof(programId, address);
  }

  async getTokenBalanceOld(
    address: string,
    programId: InnerProgramId,
    tokenId: string,
  ) {
    const [privateBalance, publicBalance] = await Promise.all([
      this.getTokenPrivateBalance(address, programId, tokenId),
      this.getTokenPublicBalance(address, programId, tokenId),
    ]);
    return {
      privateBalance,
      publicBalance,
      total: privateBalance + publicBalance,
    };
  }

  private getContractAddress = (
    programId: InnerProgramId | string,
    tokenId: string,
  ) => {
    return `${programId}-${tokenId}`;
  };

  parseContractAddress = (contractAddress: string) => {
    const [programId, tokenId] = contractAddress.split("-");
    return { programId, tokenId };
  };

  async getTokenBalance(
    params: TokenBalanceParams,
  ): Promise<BalanceResp | undefined> {
    const { address, token } = params;
    const { programId, tokenId } = this.parseContractAddress(
      token.contractAddress,
    );
    const [publicBalance, privateBalance] = await Promise.all([
      this.getTokenPublicBalance(address, programId as InnerProgramId, tokenId),
      this.getTokenPrivateBalance(
        address,
        programId as InnerProgramId,
        tokenId,
      ),
    ]);
    return {
      total: publicBalance + privateBalance,
      publicBalance,
      privateBalance,
    };
  }

  async getAllTokens() {
    const [tokens, arcaneTokens] = await Promise.all([
      this.tokenService.getTokens(),
      this.arcaneService.getTokens(),
    ]);
    return [BETA_STAKING_ALEO_TOKEN, ...tokens, ...arcaneTokens];
  }

  async searchTokens(keyword: string) {
    const searchStAleo = keyword.includes("st") || keyword.includes("ale");

    const [tokens, arcaneTokens] = await Promise.all([
      this.tokenService.searchTokens(keyword),
      this.arcaneService.searchTokens(keyword),
    ]);
    return searchStAleo
      ? [BETA_STAKING_ALEO_TOKEN, ...tokens, ...arcaneTokens]
      : [...tokens, ...arcaneTokens];
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address, onPartial } = params;

    const trustedTokens: Token[] = [
      BETA_STAKING_ALEO_TOKEN,
      USAD_TOKEN,
      USDCX_TOKEN,
    ];
    const trustedKeys = new Set(
      trustedTokens.map((t) => `${t.programId}-${t.tokenId}`),
    );
    const trustedProgramIds = new Set<string>([
      BETA_STAKING_PROGRAM_ID,
      USAD_STABLECOIN_PROGRAM_ID,
      USDCX_STABLECOIN_PROGRAM_ID,
    ]);

    type TokenWithBalance = Token & {
      balance: {
        privateBalance: bigint;
        publicBalance: bigint;
        total: bigint;
      };
    };

    // A token is kept if it has a non-zero balance, except for the staking
    // program which is always shown.
    const shouldKeep = (item: TokenWithBalance): boolean => {
      if (item.programId === BETA_STAKING_PROGRAM_ID) {
        return true;
      }
      return item.balance.total > 0n;
    };

    const toTokenV2 = (item: TokenWithBalance): TokenV2 => {
      const {
        tokenId,
        name,
        symbol,
        decimals,
        logo,
        official,
        programId,
        balance,
      } = item;
      const contractAddress =
        tokenId === BETA_STAKING_ALEO_TOKEN_ID
          ? `${programId}-stAleo`
          : `${programId}-${tokenId}`;
      return {
        symbol,
        decimals,
        name,
        type: AssetType.TOKEN,
        uniqueId: InnerChainUniqueId.ALEO_MAINNET,
        icon: logo,
        official,
        programId,
        tokenId,
        total: balance.total,
        privateBalance: balance.privateBalance,
        publicBalance: balance.publicBalance,
        ownerAddress: address,
        contractAddress,
        security: trustedProgramIds.has(programId)
          ? TokenSecurity.WHITE
          : undefined,
      };
    };

    // Resolve the balance for a single token. Each token's private + public
    // balance are fetched in parallel; failures are logged and treated as 0.
    // As soon as a kept token's balance resolves, `onPartial` is fired so the
    // UI can render it incrementally without waiting for the whole batch.
    const resolveTokenBalance = async (
      token: Token,
    ): Promise<TokenWithBalance> => {
      const [privateRes, publicRes] = await Promise.allSettled([
        this.getTokenPrivateBalance(address, token.programId, token.tokenId),
        this.getTokenPublicBalance(address, token.programId, token.tokenId),
      ]);
      if (privateRes.status === "rejected") {
        console.warn(
          "===> getUserInteractiveTokens private balance failed (treating as 0): ",
          token.programId,
          privateRes.reason,
        );
      }
      if (publicRes.status === "rejected") {
        console.warn(
          "===> getUserInteractiveTokens public balance failed (treating as 0): ",
          token.programId,
          publicRes.reason,
        );
      }
      const privateBalance =
        privateRes.status === "fulfilled" ? privateRes.value : 0n;
      const publicBalance =
        publicRes.status === "fulfilled" ? publicRes.value : 0n;
      const item: TokenWithBalance = {
        ...token,
        balance: {
          privateBalance,
          publicBalance,
          total: privateBalance + publicBalance,
        },
      };
      if (onPartial && shouldKeep(item)) {
        try {
          onPartial(toTokenV2(item));
        } catch (err) {
          console.warn(
            "===> getUserInteractiveTokens onPartial callback failed: ",
            err,
          );
        }
      }
      return item;
    };

    // Trusted tokens (stAleo / USAD / USDCX) are hard-coded and always present,
    // so their balances do not depend on the remote `getAllTokens()` feed.
    const trustedBalancesPromise = Promise.all(
      trustedTokens.map(resolveTokenBalance),
    );

    const top10BalancesPromise = (async () => {
      let feedTokens: Token[] = [];
      try {
        feedTokens = await this.getAllTokens();
      } catch (err) {
        console.warn(
          "===> getUserInteractiveTokens getAllTokens failed: ",
          err,
        );
      }
      const top10Tokens = feedTokens.length > 0 ? feedTokens.slice(1, 11) : [];
      const top10WithoutTrusted = top10Tokens.filter(
        (t) =>
          !trustedKeys.has(`${t.programId}-${t.tokenId}`) &&
          !trustedProgramIds.has(t.programId),
      );
      return await Promise.all(top10WithoutTrusted.map(resolveTokenBalance));
    })();

    const [trustedBalances, top10Balances] = await Promise.all([
      trustedBalancesPromise,
      top10BalancesPromise,
    ]);
    const balances = [...trustedBalances, ...top10Balances];

    const res: TokenV2[] = balances.filter(shouldKeep).map(toTokenV2);
    return res;
  }

  async getTokenInfoOnChain(
    tokenId: string,
  ): Promise<Omit<Token, "logo" | "official">> {
    const tokenRawInfo = await this.rpcService.getProgramMappingValue(
      ALPHA_TOKEN_PROGRAM_ID,
      ALPHA_SWAP_TOKEN_MAPPING_NAME,
      tokenId,
    );
    if (!tokenRawInfo) {
      throw new Error("Token not found");
    }
    return {
      ...JSON.parse(Plaintext.fromString(tokenRawInfo).toJSON()),
      programId: ALPHA_TOKEN_PROGRAM_ID,
    };
  }

  async getTokenInfo(
    programId: InnerProgramId,
    tokenId: string,
  ): Promise<Token | undefined> {
    switch (programId) {
      case ALPHA_TOKEN_PROGRAM_ID: {
        const allTokens = await this.tokenService.searchTokens(
          tokenId.slice(0, -5),
        );
        const token = allTokens.find((item) => item.tokenId === tokenId);
        return token;
      }
      case BETA_STAKING_PROGRAM_ID: {
        return { ...BETA_STAKING_ALEO_TOKEN };
      }
    }
  }

  private async getConfirmedTokenTransactionInfo({
    viewKey,
    address,
    record,
  }: {
    record: RecordDetailWithSpent;
    viewKey: ViewKey;
    address: string;
  }) {
    const txId = record.transactionId;
    const cachedTx = await this.aleoStorage.getCachedTransaction(
      this.chainId,
      txId,
    );
    if (cachedTx) {
      return cachedTx;
    }
    const item = await this.walletService.getTransaction(txId);
    let txType = AleoTxType.EXECUTION;
    if (item.origin_data.deployment) {
      txType = AleoTxType.DEPLOYMENT;
    }
    const isRejected =
      !item.origin_data.deployment && !item.origin_data.execution;
    let programId = "";
    let funcName = "";
    if (item.origin_data.execution?.transitions) {
      const transitions = item.origin_data.execution.transitions;
      const lastTransition = transitions[transitions.length - 1];
      programId = lastTransition.program;
      funcName = lastTransition.function;
    } else if (item.origin_data.deployment.program) {
      const program = item.origin_data.deployment.program;
      const programObj = this.parseProgram(program);
      programId = programObj.id();
    }
    const feeTransition = item.origin_data.fee?.transition;
    let fee = 0n;
    let isSender = false;
    if (feeTransition) {
      switch (feeTransition.function) {
        case "fee_public": {
          const output = feeTransition.outputs?.[0];
          if (!output || output.type !== "future") {
            return undefined;
          }
          const futureObj = this.parseFuture(output.value);
          if (!futureObj) {
            return undefined;
          }
          // 当前地址付 fee
          if (futureObj.arguments && futureObj.arguments[0] === address) {
            fee = parseU64(futureObj.arguments[1]);
            isSender = true;
          }
          break;
        }
        case "fee_private": {
          const outputs = feeTransition.outputs;
          if (!outputs?.[0]) {
            return undefined;
          }
          const output = outputs[0];
          if (output.type === "record") {
            const isOwner = this.isRecordOwner(viewKey, output.value);
            if (isOwner) {
              isSender = true;
              const baseFee = parseU64(feeTransition.inputs?.[1].value ?? "");
              const priorityFee = parseU64(
                feeTransition.inputs?.[2].value ?? "",
              );
              fee = baseFee + priorityFee;
            }
          }
          break;
        }
      }
    }

    const history: AleoOnChainHistoryItem = {
      type: AleoHistoryType.ON_CHAIN,
      txId: item.origin_data.id,
      programId,
      functionName: funcName,
      height: item.height,
      timestamp: normalizeAleoTimestampMs(item.timestamp),
      addressType: isSender
        ? AleoTxAddressType.SEND
        : AleoTxAddressType.RECEIVE,
      status: AleoTxStatus.FINALIZD,
      txType,
    };
    await this.aleoStorage.cacheTransaction(this.chainId, history);
    return history;
  }

  async getTokenOnChainHistory({
    address,
    pagination,
    token,
  }: {
    address: string;
    pagination: Pagination;
    token: TokenV2;
  }): Promise<AleoOnChainHistoryItem[]> {
    if (!token?.programId) {
      return [];
    }
    let privateHistory: AleoOnChainHistoryItem[] = [];
    const { account, records: scannerRecords } =
      await this.getScannerRecordsSnapshot(address, {
        programIds: [token.programId],
        recordFilter: RecordFilter.ALL,
      });
    const viewKeyObj = this.parseViewKey(account.viewKey);
    const records: RecordDetailWithSpent[] = [];
    for (const record of scannerRecords) {
      this.assertScannerRecordParsedContent(record);
      if (!this.recordMatchesToken(record, token.tokenId)) {
        continue;
      }

      records.push(record);
    }
    const privateTxs = await Promise.all(
      records.map(async (item) => {
        const tx = await this.getConfirmedTokenTransactionInfo({
          record: item,
          viewKey: viewKeyObj,
          address,
        });
        return tx;
      }),
    );
    privateHistory = privateTxs.filter(
      (item) => !!item,
    ) as AleoOnChainHistoryItem[];
    const historyList = [...privateHistory];
    historyList.sort((item1, item2) => {
      if (item1.height && item2.height) {
        return item2.height - item1.height;
      }
      return item2.timestamp - item1.timestamp;
    });

    return historyList;
  }

  gasUnit(): string {
    return "ALEO";
  }

  async getLatestBlockNumber(): Promise<number> {
    const height = await this.rpcService.getLatestHeight();
    if (height) {
      return height;
    }
    return -1;
  }

  supportNativeCoinTxHistory(): boolean {
    return true;
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const { pageSize, pageNum } = params.pagination;
    console.log("aleo getCoinTxHistory", pageSize, pageNum);
    const hist = await this.aleoInfoApi.getTransferHistory(
      params.address,
      pageSize * pageNum,
      pageSize,
    );
    return {
      txs: hist.transactions.map((item) => {
        return {
          id: item.transactionId,
          from: item.transferFrom?.address ?? "",
          to: item.transferTo?.address ?? "",
          value: BigInt(item.credits),
          timestamp: normalizeAleoTimestampMs(item.timestamp),
          status:
            item.state === "Pending"
              ? TransactionStatus.PENDING
              : item.state === "Accepted"
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED,
          height: item.height,
          functionName: item.functionName,
          programId: item.programId,
        };
      }),
      pagination: {
        pageSize,
        pageNum,
        endReach: hist.transactions.length < pageSize,
        totalCount: hist.transferCount,
      },
    };
  }

  // 现在解析 aleo 的交易有比较大的难度
  // 首先需要不同交易类型，交易结构不同
  // 其次一些字段如 ciphertext1qgqt3mdf8k73wkhc60duh04qypmsk9qn6ugftdsl0se22gcntl405pg4w2w23w7208phvujuxvxslgac44dluu74njq25xl63ujm36sqpv52qya5 解密遇到了困难，没有找到解析方法
  // 另外只能通过自己的 viewkey 解开自己的 record，无法解析其他人的 record
  // 因此目前 aleo 采用本地的交易历史，仅通过接口拿取交易的 fee 信息
  // 后续支持交易历史，但是不能隐私交易不能显示完全的交易信息
  supportGetTxStatus(): boolean {
    return true;
  }

  async getTxStatus(
    params: CoinTxDetailParams,
  ): Promise<TransactionStatusInfo | undefined> {
    try {
      const {
        txId,
        filter: { address, addressType },
      } = params;

      const [tx, latestHeight] = await Promise.all([
        this.walletService.getTransaction(txId),
        this.rpcService.getLatestHeight(),
      ]);
      if (!tx) {
        return undefined;
      }
      if (tx.status === -1) {
        return {
          fee: 0n,
          height: -1,
          timestamp: -1,
          confirmations: 0,
          call: "",
          status: TransactionStatus.PENDING,
          chainSpecific: {
            aleoStatus: AleoTxStatus.COMPLETED,
          },
        };
      }
      let fee = 0n;
      if (tx.origin_data.fee?.transition.function === "fee_public") {
        const baseFeeStr =
          tx.origin_data.fee?.transition.inputs?.[0]?.value || "0u64";
        const priorityFeeStr =
          tx.origin_data.fee?.transition.inputs?.[1]?.value || "0u64";
        fee =
          BigInt(baseFeeStr.slice(0, -3)) + BigInt(priorityFeeStr.slice(0, -3));
      } else if (tx.origin_data.fee?.transition.function === "fee_private") {
        const baseFeeStr =
          tx.origin_data.fee?.transition.inputs?.[1]?.value || "0u64";
        const priorityFeeStr =
          tx.origin_data.fee?.transition.inputs?.[2]?.value || "0u64";
        fee =
          BigInt(baseFeeStr.slice(0, -3)) + BigInt(priorityFeeStr.slice(0, -3));
      }
      const { height, timestamp } = tx;
      let confirmations = 0;
      if (height && latestHeight) {
        confirmations = latestHeight - height + 1;
      }
      let program;
      let fn;
      const executionTransitions = tx.origin_data.execution?.transitions;
      let executionTransition;
      const feeTransition = tx.origin_data.fee?.transition;
      if (tx.status === "accepted" && executionTransitions) {
        const length = executionTransitions.length;
        executionTransition = executionTransitions[length - 1];
        program = executionTransition?.program;
        fn = executionTransition?.function;
      }
      let from;
      let to;
      let value;
      if (addressType === "sender") {
        from = address ?? "";
        to = "";
      } else if (addressType === "receiver") {
        from = "";
        to = address ?? "";
      }
      if (program === NATIVE_TOKEN_PROGRAM_ID) {
        switch (fn) {
          case "transfer_public": {
            if (executionTransition && feeTransition) {
              from =
                feeTransition.function === "fee_public"
                  ? parseAleoFeeFuture(feeTransition.outputs?.[0]?.value)
                  : "";

              to = executionTransition.inputs?.[0]?.value;
              value = BigInt(
                executionTransition.inputs?.[1].value?.slice(0, -3) ?? 0,
              );
            }
            break;
          }
          case "transfer_public_to_private": {
            if (feeTransition) {
              from =
                feeTransition.function === "fee_public"
                  ? parseAleoFeeFuture(feeTransition.outputs?.[0]?.value)
                  : "";
            }
            value = BigInt(
              executionTransition?.inputs?.[1]?.value?.slice(0, -3) ?? 0,
            );
            break;
          }
          case "transfer_private_to_public": {
            if (feeTransition) {
              from =
                feeTransition.function === "fee_public"
                  ? parseAleoFeeFuture(feeTransition.outputs?.[0]?.value)
                  : "";
            }
            if (executionTransition) {
              to = executionTransition.inputs?.[1]?.value;
              value = BigInt(
                executionTransition.inputs?.[2].value?.slice(0, -3) ?? 0,
              );
            }
            break;
          }
        }
      }
      let call;
      if (program && fn) {
        call = `${program}-${fn}}`;
      }
      let status = TransactionStatus.PENDING;
      let aleoStatus = AleoTxStatus.QUEUED;
      if (tx.status === "accepted") {
        status = TransactionStatus.SUCCESS;
        aleoStatus =
          tx.height > 0 ? AleoTxStatus.FINALIZD : AleoTxStatus.COMPLETED;
      } else if (tx.status === "rejected") {
        status = TransactionStatus.FAILED;
        aleoStatus = AleoTxStatus.FAILED;
      } else if (tx.status === "") {
        status = TransactionStatus.PENDING;
        aleoStatus = AleoTxStatus.COMPLETED;
      }
      return {
        fee,
        height: height === 0 ? -1 : height,
        timestamp: normalizeAleoTimestampMs(timestamp),
        confirmations,
        call,
        status,
        from,
        to,
        value,
        chainSpecific: {
          aleoStatus,
        },
      };
    } catch (err) {
      console.error("getTxStatus error: ", err);
      return undefined;
    }
  }

  supportTokenTxHistory(): boolean {
    return true;
  }

  /**
   * Token-level on-chain history via the Provable explorer
   * (`/{network}/transactions/address/{addr}`). The endpoint returns every
   * transition the address took part in across all programs; we filter to
   * the program (and tokenId, when present) of the token we're viewing.
   *
   * `api.aleo.info/transfer` (used by getNativeCoinTxHistory) only covers
   * credits.aleo transfers and silently returns 0 for token programs like
   * usad_stablecoin.aleo, so this method is the only path for token
   * transfer_public history.
   */
  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp | undefined> {
    const { address, token, pagination } = params;
    const { pageSize, pageNum } = pagination;
    // Remote token feeds (USAD/USDCx and friends) sometimes ship without
    // top-level programId/tokenId fields, but always carry a
    // `${programId}-${tokenId}` contractAddress. Fall back to parsing it so
    // we can still filter the upstream feed by program. Mirrors the same
    // fallback in SendAleo/TransferInfoStep.
    const { programId: parsedProgramId, tokenId: parsedTokenId } =
      token.contractAddress
        ? this.parseContractAddress(token.contractAddress)
        : { programId: undefined, tokenId: undefined };
    const programId = token.programId ?? parsedProgramId ?? "";
    const tokenId = token.tokenId ?? parsedTokenId;
    if (!programId) {
      return {
        txs: [],
        pagination: {
          pageSize,
          pageNum,
          endReach: true,
        },
      };
    }

    // Provable explorer caps `limit` at 50; clamp our pageSize too so the
    // `offset = effectivePageSize * pageNum` math stays consistent (otherwise
    // requesting pageSize=100 from upstream returns 50 rows but our offset
    // jumps in steps of 100, skipping half the feed each page).
    const effectivePageSize = Math.min(50, Math.max(1, pageSize));

    let resp;
    try {
      resp = await this.provableApi.getTransferHistory({
        network: this.chainId,
        address,
        limit: effectivePageSize,
        offset: effectivePageSize * pageNum,
      });
    } catch (err) {
      console.error("===> aleo getTokenTxHistory error", err);
      return undefined;
    }

    const rows = resp.transactions ?? [];
    // Filter to the token we're viewing. tokenId is only meaningful for
    // token_registry-style programs (alpha/arcane); compliance + native
    // programs use the program identity alone to scope the token, so only
    // tighten the filter by tokenId when both ends supply one. The Provable
    // explorer endpoint omits `token_id` for compliance programs (one program
    // == one token), so this naturally degrades to a program-only filter.
    const filtered = rows.filter((row) => {
      if (row.programId !== programId) return false;
      if (tokenId && row.tokenId && row.tokenId !== tokenId) {
        return false;
      }
      return true;
    });

    const txs = filtered.map((row) => {
      const status =
        row.transactionStatus === "Accepted" ||
        row.transactionStatus === "Confirmed"
          ? TransactionStatus.SUCCESS
          : row.transactionStatus === "Pending"
          ? TransactionStatus.PENDING
          : TransactionStatus.FAILED;
      return {
        id: row.transactionId,
        from: row.senderAddress ?? "",
        to: row.recipientAddress ?? "",
        value:
          row.amount !== undefined && row.amount !== null
            ? BigInt(row.amount)
            : 0n,
        timestamp: Number(row.blockTimestamp) * 1000,
        status,
        height: row.blockNumber,
        programId: row.programId,
        functionName: row.functionId,
      };
    });

    return {
      txs,
      pagination: {
        pageSize,
        pageNum,
        // Compare against effectivePageSize (what upstream actually saw), not
        // the caller's pageSize, otherwise endReach=true is reported as soon
        // as we get a single capped page back even though more might exist.
        endReach: !resp.nextCursor || rows.length < effectivePageSize,
      },
    };
  }
}
