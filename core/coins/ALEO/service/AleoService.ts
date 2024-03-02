import { AleoConfig } from "../types/AleoConfig";
import { IAleoStorage } from "../types/IAleoStorage";
import {
  AleoAddressInfo,
  FutureJSON,
  RecordDetailWithSpent,
} from "../types/SyncTask";
import { parseU128, parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";
import { AutoSwitch, AutoSwitchServiceType } from "core/utils/retry";
import {
  InputItem,
  RecordFilter,
} from "@/scripts/background/servers/IWalletServer";
import { uniqBy } from "lodash";
import { AleoRpcService } from "./instances/rpc";
import {
  ALEO_METHOD_BASE_FEE_MAP,
  AleoCreditMethod,
} from "../types/TransferMethod";
import {
  AleoLocalTxInfo,
  AleoTransaction,
  AleoTxStatus,
} from "../types/Transaction";
import { AleoGasFee } from "core/types/GasFee";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  FAILED_TX_REMOVE_TIME,
  LOCAL_TX_EXPIRE_TIME,
  NATIVE_TOKEN_PROGRAM_ID,
} from "../constants";
import {
  AleoHistoryItem,
  AleoHistoryType,
  AleoLocalHistoryItem,
  AleoOnChainHistoryItem,
  AleoTxAddressType,
  AleoTxType,
} from "../types/History";
import { Mutex } from "async-mutex";
import {
  Program,
  ViewKey,
  Future,
  RecordCiphertext,
  hashBHP256,
  Plaintext,
} from "aleo_wasm";
import { AleoApiService } from "./instances/sync";
import { AleoSyncAccount } from "../types/AleoSyncAccount";
import { AleoWalletService } from "./instances/api";
import { Pagination } from "../types/Pagination";
import { FaucetMessage, FaucetResp } from "../types/Faucet";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { TokenService } from "./instances/token";
import { Token, TokenWithBalance } from "../types/Token";

const CREDITS_MAPPING_NAME = "account";

const ALPHA_SWAP_TOKEN_MAPPING_NAME = "tokens";

const mutex = new Mutex();

const SYNS_BLOCK_INTERVAL = 1000;

const GET_SPENT_TAGS_SIZE = 500;

// only for popup thread
export class AleoService {
  config: AleoConfig;
  chainId: string;
  private aleoStorage: IAleoStorage;
  private rpcService: AleoRpcService;
  private apiService: AleoApiService;
  private walletService: AleoWalletService;
  private tokenService: TokenService;
  private cachedSyncBlock: AleoAddressInfo | null = null;
  private lastSyncBlockTime: number = 0;

  constructor(config: AleoConfig, storage: IAleoStorage) {
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = storage;
    this.rpcService = new AleoRpcService({
      configs: config.rpcList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    });
    this.apiService = new AleoApiService({
      configs: config.syncApiList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    });
    this.walletService = new AleoWalletService({
      configs: config.walletApiList.map((item) => ({
        url: item,
        chainId: config.chainId,
      })),
    });
    if (this.config.alphaSwapApi) {
      this.tokenService = new TokenService({
        configs: [
          {
            url: this.config.alphaSwapApi,
            chainId: this.config.chainId,
          },
        ],
      });
    }
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.API })
  private async getSpentTagsInRange(tags: string[]) {
    return await this.apiService.currInstance().getSpentTags(tags);
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
    const [recordRanges, latestRecordIndex, nodeStatus] = await Promise.all([
      this.aleoStorage.getAleoRecordRanges(this.chainId, address),
      this.apiService.currInstance().getLatestRecordIndex(),
      this.apiService.currInstance().getNodeStatus(),
    ]);

    if (recordRanges.length === 0) {
      return latestRecordIndex > 0 ? 0 : 100;
    }
    const { syncHeight, referenceHeight } = nodeStatus;
    const finishRecordCount = recordRanges
      .map((item) => {
        const [start, end] = item.split("-");
        return [parseInt(start), parseInt(end)];
      })
      .reduce((prev, curr) => {
        return prev + curr[1] - curr[0] + 1;
      }, 0);
    return Math.min(
      Math.floor(
        (((finishRecordCount / (latestRecordIndex + 1)) * syncHeight) /
          referenceHeight) *
          100,
      ),
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
        allRecordsMap[NATIVE_TOKEN_PROGRAM_ID] = creditsRecords;
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getPublicBalance(address: string): Promise<bigint> {
    const balance = await this.rpcService
      .currInstance()
      .getProgramMappingValue(
        this.config.nativeCurrency.address,
        CREDITS_MAPPING_NAME,
        address,
      );
    console.log("===> public balance: ", balance);
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
      privateBalance: privateBalance,
      publicBalance: publicBalance,
      total: privateBalance + publicBalance,
    };
  }

  async getBaseFee(method: AleoCreditMethod): Promise<bigint> {
    const fee = ALEO_METHOD_BASE_FEE_MAP[method];
    if (fee) {
      return fee;
    }
    const baseFee = await this.walletService
      .currInstance()
      .getBaseFee({ txType: method });
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
      const priorityFee = await this.walletService
        .currInstance()
        .getPriorityFee();
      if (priorityFee) {
        return BigInt(priorityFee);
      }
      const [latestBlock] = await Promise.all([
        this.rpcService.currInstance().getLatestBlock(),
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

  async getGasFee(method: AleoCreditMethod): Promise<AleoGasFee> {
    const [baseFee, priorityFee] = await Promise.all([
      this.getBaseFee(method),
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
      const future = Future.fromString(futureStr);
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getProgramContent(chainId: string, programId: string) {
    const cache = await this.aleoStorage.getProgramContent(chainId, programId);
    console.log("===> getProgramContent cache: ", cache?.length);
    if (cache) {
      return cache;
    }
    const program = await this.rpcService.currInstance().getProgram(programId);
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
          result.recordsMap[programId] || {},
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

  async getPublicTxHistory(
    address: string,
    pagination: Pagination,
  ): Promise<AleoOnChainHistoryItem[]> {
    const { cursor } = pagination;
    const publicHistory = await this.walletService
      .currInstance()
      .getPublicHistory(address, cursor);
    return publicHistory.map((item) => {
      return {
        type: AleoHistoryType.ON_CHAIN,
        txId: item.transactionId,
        programId: item.executionProgram,
        functionName: item.executionFunction,
        height: item.blockHeight,
        timestamp: item.blockTime,
        addressType: AleoTxAddressType.SEND,
        amount: !!item.executionValue
          ? parseU64(item.executionValue).toString()
          : undefined,
        txType: AleoTxType.EXECUTION, // TODO: split EXECUTION and DEPLOYMENT
        status: AleoTxStatus.FINALIZD,
      };
    });
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  private async getTxInfoOnChain(txId: string): Promise<AleoTransaction> {
    return await this.rpcService.currInstance().getTransaction(txId);
  }

  async processLocalTxInfo(
    address: string,
    txInfo?: AleoLocalTxInfo | null,
    program?: string,
  ) {
    let result: AleoLocalHistoryItem | null = null;
    if (!txInfo) {
      return null;
    }
    if (program && txInfo.programId !== program) {
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
        };
        break;
      }
    }
    return result;
  }

  async getLocalTxHistory(
    address: string,
    program?: string,
  ): Promise<AleoLocalHistoryItem[]> {
    const localTxs = await this.aleoStorage.getAddressLocalTxs(
      this.chainId,
      address,
    );

    const txs = await Promise.all(
      localTxs.map(async (item) => {
        return await this.processLocalTxInfo(address, item, program);
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

  private async getConfirmedTransactionInfo(
    txId: string,
    viewKey: ViewKey,
    address: string,
  ) {
    const cachedTx = await this.aleoStorage.getCachedTransaction(
      this.chainId,
      txId,
    );
    if (cachedTx) {
      return cachedTx;
    }
    const item = await this.walletService.currInstance().getTransaction(txId);
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
              const baseFee = parseU64(feeTransition.inputs?.[1].value || "");
              const priorityFee = parseU64(
                feeTransition.inputs?.[2].value || "",
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
      programId: programId,
      functionName: funcName,
      height: item.height,
      timestamp: item.timestamp,
      addressType: isSender
        ? AleoTxAddressType.SEND
        : AleoTxAddressType.RECEIVE,
      status: AleoTxStatus.FINALIZD,
      txType: txType,
    };
    await this.aleoStorage.cacheTransaction(this.chainId, history);
    return history;
  }

  async getOnChainHistory(
    address: string,
    pagination: Pagination,
  ): Promise<AleoOnChainHistoryItem[]> {
    const [publicHistory] = await Promise.all([
      this.getPublicTxHistory(address, pagination),
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
      for (let recordMap of Object.values(recordsMap)) {
        if (!recordMap) {
          continue;
        }
        for (let record of Object.values(recordMap)) {
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
          const tx = await this.getConfirmedTransactionInfo(
            item,
            viewKeyObj,
            address,
          );
          return tx;
        }),
      );
      privateHistory = privateTxs.filter(
        (item) => !!item,
      ) as AleoOnChainHistoryItem[];
    }
    const historyList = [...publicHistory, ...privateHistory];
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

  async getTxHistory(
    address: string,
    pagination: Pagination,
    program?: string,
  ): Promise<AleoHistoryItem[]> {
    const [publicHistory, localTxList] = await Promise.all([
      this.getPublicTxHistory(address, pagination),
      this.getLocalTxHistory(address, program),
    ]);
    const lastHeight = pagination.cursor
      ? parseInt(pagination.cursor)
      : undefined;
    const startHeight = publicHistory[publicHistory.length - 1].height;
    const syncBlocksResult = await this.debounceSyncBlocks(address);
    const account = await this.aleoStorage.getAccountInfo(address);
    let privateHistory: AleoHistoryItem[] = [];
    if (account) {
      const viewKeyObj = this.parseViewKey(account.viewKey);
      const recordsMap = syncBlocksResult?.recordsMap ?? {};
      const records = [];
      for (let recordMap of Object.values(recordsMap)) {
        if (!recordMap) {
          continue;
        }
        for (let record of Object.values(recordMap)) {
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
          const tx = await this.getConfirmedTransactionInfo(
            item,
            viewKeyObj,
            address,
          );
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

  async setAleoSyncAccount(account: AleoSyncAccount) {
    await this.aleoStorage.setAccountInfo(account);
  }

  async faucetMessage(address: string): Promise<FaucetMessage> {
    const content = await this.walletService
      .currInstance()
      .getFaucetContent({ address });
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
    const status = await this.walletService
      .currInstance()
      .getFaucetStatus({ address });
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
    const res = await this.walletService.currInstance().requestFaucet({
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
        const records = recordsMap[item.program_id] || {};
        const existRecord = records[item.id];
        if (existRecord && existRecord.plaintext) {
          if (item.program_id === NATIVE_TOKEN_PROGRAM_ID) {
            usedCreditRecords.push(existRecord);
          }
          return existRecord.plaintext;
        }
      }
      throw new Error("Invalid input item: " + item);
    });
    const creditsRecords = Object.values(
      recordsMap[NATIVE_TOKEN_PROGRAM_ID] || {},
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
  supportToken() {
    return !!this.config.alphaSwapApi;
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getTokenPublicBalance(address: string, tokenId: string) {
    const id = hashBHP256(`{ token: ${tokenId}, user: ${address} }`);
    console.log("===> public balance id: ", tokenId, address, id);
    const balance = await this.rpcService
      .currInstance()
      .getProgramMappingValue(ALPHA_TOKEN_PROGRAM_ID, CREDITS_MAPPING_NAME, id);
    console.log("===> token public balance: ", balance, id);
    if (!balance || balance === "null") {
      return 0n;
    }
    return parseU128(balance);
  }

  async getTokenPrivateBalance(address: string, tokenId: string) {
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

  async getTokenBalance(address: string, tokenId: string) {
    const [privateBalance, publicBalance] = await Promise.all([
      this.getTokenPrivateBalance(address, tokenId),
      this.getTokenPublicBalance(address, tokenId),
    ]);
    return {
      privateBalance,
      publicBalance,
      total: privateBalance + publicBalance,
    };
  }

  async getAllTokens() {
    const tokens = await this.tokenService.currInstance().getTokens();
    return tokens;
  }

  async searchTokens(keyword: string) {
    const tokens = await this.tokenService.currInstance().searchTokens(keyword);
    return tokens;
  }

  async getInteractiveTokens(address: string): Promise<TokenWithBalance[]> {
    const tokens = await this.getAllTokens();
    const top10Tokens = tokens.slice(0, 10);
    let balances = await Promise.all(
      top10Tokens.map(async (token) => {
        try {
          const balance = await this.getTokenBalance(address, token.tokenId);
          return {
            ...token,
            balance,
          };
        } catch (err) {
          console.error("===> getInteractiveTokens error: ", err);
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
    return non0Tokens;
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getTokenInfoOnChain(
    tokenId: string,
  ): Promise<Omit<Token, "logo" | "official">> {
    const tokenRawInfo = await this.rpcService
      .currInstance()
      .getProgramMappingValue(
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

  async getTokenInfo(tokenId: string): Promise<Token | undefined> {
    const allTokens = await this.tokenService
      .currInstance()
      .searchTokens(tokenId.slice(0, -5));
    const token = allTokens.find((item) => item.tokenId === tokenId);
    return token;
  }
}
