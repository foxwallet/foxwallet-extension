import { type AleoConfig } from "../types/AleoConfig";
import { type IAleoStorage } from "../types/IAleoStorage";
import {
  type AleoAddressInfo,
  type FutureJSON,
  type RecordDetailWithSpent,
} from "../types/SyncTask";
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
  BETA_STAKING_PROGRAM_ID,
  LOCAL_TX_EXPIRE_TIME,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "../constants";
import {
  type AleoHistoryItem,
  AleoHistoryType,
  type AleoLocalHistoryItem,
  type AleoOnChainHistoryItem,
  AleoTxAddressType,
  AleoTxType,
} from "../types/History";
import { Mutex } from "async-mutex";
import {
  Address,
  FoxFuture,
  hashBHP256,
  Plaintext,
  Program,
  RecordCiphertext,
  ViewKey,
} from "aleo_wasm_mainnet";
import { type AleoApiService, createAleoApiService } from "./instances/sync";
import { type AleoSyncAccount } from "../types/AleoSyncAccount";
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
import { BETA_STAKING_ALEO_TOKEN } from "../config/chains";
import { isNotEmpty } from "core/utils/is";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import { CoinServiceBasic } from "core/coins/CoinServiceBasic";
import { AssetType, type TokenV2 } from "core/types/Token";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { InteractiveTokenParams } from "core/types/TokenTransaction";
import { type BalanceResp, type TokenBalanceParams } from "core/types/Balance";

const CREDITS_MAPPING_NAME = "account";

const ALPHA_SWAP_TOKEN_MAPPING_NAME = "tokens";

const mutex = new Mutex();

const SYNS_BLOCK_INTERVAL = 1000;

const GET_SPENT_TAGS_SIZE = 500;

// only for popup thread
export class AleoService extends CoinServiceBasic {
  config: AleoConfig;
  chainId: string;
  private aleoStorage: IAleoStorage;
  private rpcService: AleoRpcService;
  private apiService: AleoApiService;
  private walletService: AleoWalletService;
  private tokenService: AlphaSwapTokenService;
  private cachedSyncBlock: AleoAddressInfo | null = null;
  private lastSyncBlockTime: number = 0;

  constructor(config: AleoConfig) {
    super(config);
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = AleoStorage.getInstance();
    this.rpcService = createAleoRpcService(
      config.rpcList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    );
    this.apiService = createAleoApiService(
      config.syncApiList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    );
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
  }

  validateAddress(address: string): boolean {
    try {
      const addressObj = Address.from_string(address);
      console.log("===> addressObj: ", addressObj, !!addressObj);
      return !!addressObj;
    } catch (err) {
      logger.log("===> isValidAddress failed: ", err, address);
      return false;
    }
  }

  private async getSpentTagsInRange(tags: string[]) {
    return await this.apiService.getSpentTags(tags);
  }

  private async getSpentTags(tags: string[]) {
    if (tags.length <= GET_SPENT_TAGS_SIZE) {
      const spentTags = await this.getSpentTagsInRange(tags);
      return spentTags;
    }
    const result: string[] = [];
    for (let i = 0; i < tags.length; i += GET_SPENT_TAGS_SIZE) {
      const subTags = tags.slice(i, i + GET_SPENT_TAGS_SIZE);
      const subSpentTags = await this.getSpentTagsInRange(subTags);
      result.push(...subSpentTags);
    }
    return result;
  }

  public async getSyncProgress(address: string): Promise<number> {
    const [recordRanges, nodeStatus] = await Promise.all([
      this.aleoStorage.getAleoRecordRanges(this.chainId, address),
      this.apiService.getNodeStatus(),
    ]);
    const { referenceHeight, serverHeight } = nodeStatus;
    const maxHeight = Math.max(referenceHeight ?? 0, serverHeight ?? 0);

    const finishHeight = recordRanges
      .map((item) => {
        const [start, end] = item.split("-");
        return [parseInt(start), parseInt(end)];
      })
      .reduce((prev, curr) => {
        return prev + curr[1] - curr[0] + 1;
      }, 0);
    return Math.min(
      // add some buffer to avoid always 99%
      Math.floor(((finishHeight + 20) / maxHeight) * 100),
      100,
    );
  }

  private syncRecords = async (
    address: string,
  ): Promise<AleoAddressInfo | null> => {
    const release = await mutex.acquire();
    try {
      const addressInfo = await this.aleoStorage.getAddressInfo(
        this.chainId,
        address,
      );

      const records = await this.aleoStorage.getAleoRecords(
        this.chainId,
        address,
      );

      if (records.length === 0) {
        return null;
      }

      const allRecordsMap: {
        [program in string]?: {
          [commitment in string]?: RecordDetailWithSpent;
        };
      } = addressInfo?.recordsMap ?? {};
      let [existBegin, existEnd] = addressInfo?.range ?? [];

      for (let i = 0; i < records.length; i += 1) {
        const blockInfo = records[i];

        const { recordsMap, range } = blockInfo;
        const [recordBegin, recordEnd] = range;
        if (existBegin !== undefined && existEnd !== undefined) {
          existBegin = Math.min(existBegin, recordBegin);
          existEnd = Math.max(existEnd, recordEnd);
        } else {
          existBegin = recordBegin;
          existEnd = recordEnd;
        }
        for (const [programId, records] of Object.entries(recordsMap)) {
          if (!records || Object.keys(records).length === 0) {
            continue;
          }
          const newRecords = allRecordsMap[programId] ?? {};
          for (const record of Object.values(records)) {
            if (!record) {
              continue;
            }
            if (!record.tag) {
              logger.error("===> getBalance record.tag is null", record);
            }
            const { commitment } = record;
            if (!newRecords[commitment]) {
              logger.log("===> insert record: ", record);
              newRecords[commitment] = {
                ...record,
                spent: false,
              };
            }
          }
          allRecordsMap[programId] = newRecords;
        }
      }
      const creditsRecords = allRecordsMap[NATIVE_TOKEN_PROGRAM_ID];
      if (creditsRecords) {
        for (const [commitment, record] of Object.entries(creditsRecords)) {
          if (!record || record.parsedContent) {
            continue;
          }
          record.parsedContent = {
            microcredits: record.content.microcredits.slice(0, -11),
          };
          creditsRecords[commitment] = record;
        }
        allRecordsMap[NATIVE_TOKEN_PROGRAM_ID] = creditsRecords;
      }
      const tokenRecords = allRecordsMap[ALPHA_TOKEN_PROGRAM_ID];
      if (tokenRecords) {
        for (const [commitment, record] of Object.entries(tokenRecords)) {
          if (!record || record.parsedContent) {
            continue;
          }
          record.parsedContent = {
            token: record.content.token.slice(0, -8),
            amount: record.content.amount.slice(0, -12),
          };
          tokenRecords[commitment] = record;
        }
        allRecordsMap[ALPHA_TOKEN_PROGRAM_ID] = tokenRecords;
      }

      const stAleoRecords = allRecordsMap[BETA_STAKING_PROGRAM_ID];
      if (stAleoRecords) {
        for (const [commitment, record] of Object.entries(stAleoRecords)) {
          if (!record || record.parsedContent) {
            continue;
          }
          record.parsedContent = {
            amount: record.content.amount.slice(0, -11),
          };
          stAleoRecords[commitment] = record;
        }
        allRecordsMap[BETA_STAKING_PROGRAM_ID] = stAleoRecords;
      }

      const result = {
        recordsMap: allRecordsMap,
        range: [existBegin, existEnd],
      };
      console.log("===> syncRecords result: ", result);
      await this.aleoStorage.setAddressInfo(this.chainId, address, result);
      const unspentRecordTagsMap = Object.entries(allRecordsMap).reduce(
        (
          res: { [key in string]: { programId: string; commitment: string } },
          [programId, curr],
        ) => {
          if (!curr) {
            return res;
          }
          for (const [commitment, record] of Object.entries(curr)) {
            if (!record) {
              continue;
            }
            if (!record.spent) {
              res[record.tag] = {
                programId,
                commitment,
              };
            }
          }
          return res;
        },
        {},
      );
      const unspentTags = Object.keys(unspentRecordTagsMap);
      const spentTags = await this.getSpentTags(unspentTags);
      if (spentTags.length > 0) {
        for (const tag of spentTags) {
          const { programId, commitment } = unspentRecordTagsMap[tag];
          const record = allRecordsMap[programId]?.[commitment];
          if (record) {
            record.spent = true;
            allRecordsMap[programId]![commitment] = record;
          }
        }
        const result = {
          recordsMap: allRecordsMap,
          range: [existBegin, existEnd],
        };
        await this.aleoStorage.setAddressInfo(this.chainId, address, result);
      }
      return result;
    } finally {
      release();
    }
  };

  public debounceSyncBlocks = async (
    address: string,
  ): Promise<AleoAddressInfo | null> => {
    if (
      !this.cachedSyncBlock ||
      Date.now() - this.lastSyncBlockTime > SYNS_BLOCK_INTERVAL
    ) {
      this.cachedSyncBlock = await this.syncRecords(address);
      this.lastSyncBlockTime = Date.now();
    }
    return this.cachedSyncBlock;
  };

  async getPrivateBalance(address: string): Promise<bigint> {
    const result = await this.debounceSyncBlocks(address);

    if (!result) {
      return 0n;
    }

    const { recordsMap } = result;

    const privateBalance =
      Object.values(
        recordsMap[this.config.nativeCurrency.address] ?? {},
      )?.reduce((sum, record) => {
        if (!record) {
          return sum;
        }
        if (record.spent) {
          return sum;
        }
        return sum + parseU64(record.content.microcredits);
      }, 0n) ?? 0n;

    return privateBalance;
  }

  async getPublicBalance(address: string): Promise<bigint> {
    const balance = await this.rpcService.getProgramMappingValue(
      this.config.nativeCurrency.address,
      CREDITS_MAPPING_NAME,
      address,
    );
    if (!balance || balance === "null") {
      return 0n;
    }
    return parseU64(balance);
  }

  async getBalance(address: string) {
    const [privateBalance, publicBalance] = await Promise.all([
      this.getPrivateBalance(address),
      this.getPublicBalance(address),
    ]);

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

  private parseFuture = (futureStr?: string): FutureJSON | undefined => {
    if (!futureStr) {
      return undefined;
    }
    try {
      const future = FoxFuture.fromString(futureStr);
      const futureObj = JSON.parse(future.toJSON());
      return futureObj;
    } catch (err) {
      console.error("===> parseFuture error: ", err);
      return undefined;
    }
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
  ): Promise<RecordDetailWithSpent[]> {
    const result = await this.debounceSyncBlocks(address);

    if (!result) {
      return [];
    }
    let recordsMap = result.recordsMap[programId] ?? {};
    if (withRecordName) {
      const { records: recordWithName, changed } =
        await this.getRecordsWithName(
          programId,
          result.recordsMap[programId] ?? {},
        );
      recordsMap = recordWithName;
      if (changed) {
        const newResult: typeof result = {
          ...result,
          recordsMap: {
            ...result.recordsMap,
            [programId]: recordWithName,
          },
        };
        await this.aleoStorage.setAddressInfo(this.chainId, address, newResult);
      }
    }

    const records = Object.values(recordsMap ?? {}).filter((item) => {
      if (!item) {
        return false;
      }
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
    }) as RecordDetailWithSpent[];
    if (programId !== NATIVE_TOKEN_PROGRAM_ID) {
      return records;
    } else {
      return records
        .map((record) => {
          return {
            ...record,
            parsedContent: {
              microcredits: BigInt(
                record.parsedContent?.microcredits ||
                  record.content.microcredits.slice(0, -11),
              ),
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
      timestamp: item.timestamp,
      addressType: isSender
        ? AleoTxAddressType.SEND
        : AleoTxAddressType.RECEIVE,
      status: AleoTxStatus.FINALIZD,
      txType,
    };
    await this.aleoStorage.cacheTransaction(this.chainId, history);
    return history;
  }

  async getOnChainHistory({
    address,
    pagination,
  }: {
    address: string;
    pagination: Pagination;
  }): Promise<AleoOnChainHistoryItem[]> {
    const [publicHistory] = await Promise.all([
      this.getPublicTxHistory({ address, pagination }),
    ]);
    const lastHeight = pagination.cursor
      ? parseInt(pagination.cursor)
      : undefined;
    const startHeight = publicHistory[publicHistory.length - 1].height;
    const syncBlocksResult = await this.debounceSyncBlocks(address);
    const account = await this.aleoStorage.getAccountInfo(address);
    let privateHistory: AleoOnChainHistoryItem[] = [];
    if (account) {
      const viewKeyObj = this.parseViewKey(account.viewKey);
      const recordsMap = syncBlocksResult?.recordsMap ?? {};
      const records = [];
      for (const recordMap of Object.values(recordsMap)) {
        if (!recordMap) {
          continue;
        }
        for (const record of Object.values(recordMap)) {
          if (!record) {
            continue;
          }
          records.push(record);
        }
      }
      const recordsInRange = records.filter((item) => {
        if (lastHeight !== undefined && item.height > lastHeight) {
          return false;
        }
        if (item.height < startHeight) {
          return false;
        }
        // record occurred in public history
        if (
          publicHistory.some((history) => history.txId === item.transactionId)
        ) {
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
      privateHistory = privateTxs.filter(
        (item) => !!item,
      ) as AleoOnChainHistoryItem[];
    }
    const historyList = [...publicHistory, ...privateHistory];
    historyList.sort((item1, item2) => {
      if (item1.height && item2.height) {
        return item2.height - item1.height;
      }
      return item2.timestamp - item1.timestamp;
    });

    return historyList;
  }

  async getPrivateTxHistory(
    address: string,
    program?: string,
    tokenId?: string,
  ) {
    const result = await this.debounceSyncBlocks(address);
    if (!result) return [];
    const { recordsMap } = result;
    let records: RecordDetailWithSpent[] = [];
    if (program) {
      if (program === ALPHA_TOKEN_PROGRAM_ID) {
        records = Object.values(recordsMap[program] ?? {}).filter((item) => {
          if (!item) return false;
          return item.parsedContent?.token === tokenId;
        }) as RecordDetailWithSpent[];
      } else {
        records = Object.values(recordsMap[program] ?? {}).filter(isNotEmpty);
      }
    } else {
      const programs = Object.keys(recordsMap);
      for (const program of programs) {
        const res = Object.values(recordsMap[program] ?? {}).filter(isNotEmpty);
        records = records.concat(res);
      }
    }

    const groupRecords = groupBy(records, (item) => item.transactionId);

    const transactionIds = Object.keys(groupRecords);
    transactionIds.sort((txId1, txId2) => {
      const records1 = groupRecords[txId1];
      const records2 = groupRecords[txId2];
      return records2[0].height - records1[0].height;
    });

    return transactionIds.map((txId) => {
      const records = groupRecords[txId];
      const executionRecords = [];
      const feeRecords = [];
      let height = 0;
      for (const record of records) {
        height = record.height;
        record.timestamp = record.timestamp * 1000;
        if (
          record.programId === NATIVE_TOKEN_PROGRAM_ID &&
          record.functionName.startsWith("fee")
        ) {
          feeRecords.push(record);
        } else {
          executionRecords.push(record);
        }
      }
      return {
        txId,
        height,
        executionRecords,
        feeRecords,
      };
    });
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
    const syncBlocksResult = await this.debounceSyncBlocks(address);
    const account = await this.aleoStorage.getAccountInfo(address);
    let privateHistory: AleoHistoryItem[] = [];
    if (account) {
      const viewKeyObj = this.parseViewKey(account.viewKey);
      const recordsMap = syncBlocksResult?.recordsMap ?? {};
      const records = [];
      for (const recordMap of Object.values(recordsMap)) {
        if (!recordMap) {
          continue;
        }
        for (const record of Object.values(recordMap)) {
          if (!record) {
            continue;
          }
          records.push(record);
        }
      }
      const recordsInRange = records.filter((item) => {
        if (lastHeight !== undefined && item.height > lastHeight) {
          return false;
        }
        if (startHeight !== undefined && item.height < startHeight) {
          return false;
        }
        // record occurred in public history
        if (
          publicHistory.some((history) => history.txId === item.transactionId)
        ) {
          return false;
        }
        // record occured in local history
        if (
          localTxList.some((history) => history.txId === item.transactionId)
        ) {
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
    }

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
    await this.aleoStorage.clearAddressLocalData(this.chainId, adderss);
  }

  async resetChainData() {
    await this.aleoStorage.reset(this.chainId);
  }

  async setAleoSyncAccount(account: AleoSyncAccount) {
    await this.aleoStorage.setAccountInfo(account);
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
    const result = await this.debounceSyncBlocks(address);
    if (!result) {
      throw new Error("Get records failed");
    }
    const recordsMap = result.recordsMap || {};

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
            microcredits: BigInt(
              record.parsedContent?.microcredits ||
                record.content.microcredits.slice(0, -11),
            ),
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
    switch (programId) {
      case ALPHA_TOKEN_PROGRAM_ID: {
        const result = await this.getRecords(
          address,
          ALPHA_TOKEN_PROGRAM_ID,
          RecordFilter.UNSPENT,
        );
        return result.reduce((sum, record) => {
          if (record.parsedContent) {
            if (record.parsedContent.token !== tokenId) {
              return sum;
            } else {
              return sum + BigInt(record.parsedContent.amount);
            }
          } else {
            if (record.content.token.slice(0, -8) !== tokenId) {
              return sum;
            } else {
              return sum + BigInt(record.content.amount.slice(0, -12));
            }
          }
        }, 0n);
      }
      case BETA_STAKING_PROGRAM_ID: {
        const result = await this.getRecords(
          address,
          BETA_STAKING_PROGRAM_ID,
          RecordFilter.UNSPENT,
        );

        if (!result) {
          return 0n;
        }

        return result.reduce((sum, record) => {
          if (record.parsedContent) {
            return sum + BigInt(record.parsedContent.amount);
          } else {
            return sum + BigInt(record.content.amount.slice(0, -11));
          }
        }, 0n);
      }
      default: {
        throw new Error("Unsupported program id " + programId);
      }
    }
  }

  // TODO impl new api
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

  private parseContractAddress = (tokenId: string) => {
    const [programId, tokenIdStr] = tokenId.split("-");
    return { programId, tokenId: tokenIdStr };
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
    const tokens = await this.tokenService.getTokens();
    return [BETA_STAKING_ALEO_TOKEN, ...tokens];
  }

  async searchTokens(keyword: string) {
    const searchStAleo = keyword.includes("st") || keyword.includes("ale");
    const tokens = await this.tokenService.searchTokens(keyword);
    return searchStAleo ? [BETA_STAKING_ALEO_TOKEN, ...tokens] : tokens;
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;
    const tokens = await this.getAllTokens();
    const top10Tokens = tokens.slice(0, 10);
    const balances = await Promise.all(
      top10Tokens.map(async (token) => {
        try {
          const balance = await this.getTokenBalanceOld(
            address,
            ALPHA_TOKEN_PROGRAM_ID,
            token.tokenId,
          );
          return {
            ...token,
            balance,
          };
        } catch (err) {
          console.error("===> getUserInteractiveTokens error: ", err);
          return {
            ...token,
            balance: {
              privateBalance: 0n,
              publicBalance: 0n,
              total: 0n,
            },
          };
        }
      }),
    );
    const non0Tokens = balances.filter((item) => item.balance.total > 0n);
    const stAleoToken: TokenWithBalance = {
      ...BETA_STAKING_ALEO_TOKEN,
      balance: {
        privateBalance: 0n,
        publicBalance: 0n,
        total: 0n,
      },
    };
    try {
      const balance = await this.getTokenBalanceOld(
        address,
        stAleoToken.programId,
        stAleoToken.tokenId,
      );
      stAleoToken.balance = {
        ...balance,
      };
    } catch (err) {
      console.error("===> getUserInteractiveTokens stAleo error: ", err);
    }
    const temp: TokenWithBalance[] = [stAleoToken, ...non0Tokens];
    const res: TokenV2[] = temp.map((item) => {
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
        contractAddress: "",
      };
    });
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
      timestamp: item.timestamp,
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
    const syncBlocksResult = await this.debounceSyncBlocks(address);
    const account = await this.aleoStorage.getAccountInfo(address);
    let privateHistory: AleoOnChainHistoryItem[] = [];
    if (account) {
      const viewKeyObj = this.parseViewKey(account.viewKey);
      const recordMap = syncBlocksResult?.recordsMap[token.programId] ?? {};
      const records: RecordDetailWithSpent[] = [];
      for (const record of Object.values(recordMap)) {
        if (!record) {
          continue;
        }
        if (!record.parsedContent) {
          switch (record.programId) {
            case ALPHA_TOKEN_PROGRAM_ID: {
              record.parsedContent = {
                token: record.content.token.slice(0, -8),
                amount: record.content.amount.slice(0, -12),
              };
              if (record.parsedContent.token !== token.tokenId) {
                continue;
              }
              break;
            }
            case BETA_STAKING_PROGRAM_ID: {
              record.parsedContent = {
                amount: record.content.amount.slice(0, -11),
              };
              break;
            }
            default: {
              throw new Error(
                "Unsupported token program id " + record.programId,
              );
            }
          }
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
    }
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
}
