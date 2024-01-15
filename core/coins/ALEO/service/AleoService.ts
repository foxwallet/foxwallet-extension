import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConfig } from "../types/AleoConfig";
import { IAleoStorage } from "../types/IAleoStorage";
import { AleoAddressInfo, RecordDetailWithSpent } from "../types/SyncTask";
import { parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";
import { AutoSwitch, AutoSwitchServiceType } from "core/utils/retry";
import {
  InputItem,
  RecordFilter,
} from "@/scripts/background/servers/IWalletServer";
import { chain, uniqBy } from "lodash";
import { AleoRpcService } from "./instances/rpc";
import {
  ALEO_METHOD_BASE_FEE_MAP,
  AleoCreditMethod,
  AleoRecordMethod,
  AleoTransferMethod,
} from "../types/TransferMethod";
import {
  AleoLocalTxInfo,
  AleoTransaction,
  AleoTxStatus,
} from "../types/Tranaction";
import { AleoGasFee } from "core/types/GasFee";
import {
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
} from "../types/History";
import { Mutex } from "async-mutex";
import { Program } from "aleo_wasm";
import { AleoApiService } from "./instances/sync";
import { AleoSyncAccount } from "../types/AleoSyncAccount";

const CREDITS_MAPPING_NAME = "account";

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
    const [recordRanges, latestRecordIndex] = await Promise.all([
      this.aleoStorage.getAleoRecordRanges(this.chainId, address),
      this.apiService.currInstance().getLatestRecordIndex(),
    ]);

    if (recordRanges.length === 0) {
      return latestRecordIndex > 0 ? 0 : 100;
    }
    const finishRecordCount = recordRanges
      .map((item) => {
        const [start, end] = item.split("-");
        return [parseInt(start), parseInt(end)];
      })
      .reduce((prev, curr) => {
        return prev + curr[1] - curr[0] + 1;
      }, 0);
    return Math.min(
      Math.floor((finishRecordCount / (latestRecordIndex + 1)) * 100),
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
    return ALEO_METHOD_BASE_FEE_MAP[method];
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
      return 10000n;
    }
    feeList.sort((fee1, fee2) => Number(fee1 - fee2));
    return feeList[Math.floor(feeList.length / 2)];
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

  async getOnChainTxHistory(
    address: string,
    limit: number = 1000,
    program?: string,
  ): Promise<AleoOnChainHistoryItem[]> {
    return [];
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
              txId,
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
              txId,
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
              status: AleoTxStatus.REJECTED,
            });
            result = {
              type: AleoHistoryType.LOCAL,
              localId: txInfo.localId,
              status: AleoTxStatus.REJECTED,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              error: errorMsg,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
              txId,
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
              txId,
            };
          }
        }
        break;
      }
      case AleoTxStatus.FAILED:
      case AleoTxStatus.REJECTED: {
        const now = Date.now();
        const timestamp = txInfo.timestamp;
        if (now - timestamp >= FAILED_TX_REMOVE_TIME) {
          await this.aleoStorage.removeAddressLocalTx(
            this.chainId,
            address,
            txInfo.localId,
          );
        } else {
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
          };
        }
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

  async getTxHistory(
    address: string,
    program?: string,
  ): Promise<AleoHistoryItem[]> {
    const [onChainTxList, localTxList] = await Promise.all([
      this.getOnChainTxHistory(address, 1000, program),
      this.getLocalTxHistory(address, program),
    ]);
    const otherTxList = [];
    const finishedLocalTxList = [];
    for (const tx of localTxList) {
      switch (tx.status) {
        case AleoTxStatus.QUEUED:
        case AleoTxStatus.GENERATING_PROVER_FILES:
        case AleoTxStatus.GENERATING_TRANSACTION:
        case AleoTxStatus.BROADCASTING:
        case AleoTxStatus.REJECTED:
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
      [...finishedLocalTxList, ...onChainTxList],
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
}
