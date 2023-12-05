import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConfig } from "../types/AleoConfig";
import { IAleoStorage } from "../types/IAleoStorage";
import { AleoAddressInfo, RecordDetailWithSpent } from "../types/SyncTask";
import { parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";
import { AutoSwitch } from "@/common/utils/retry";
import { AutoSwitchServiceType } from "@/common/types/retry";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
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

const CREDITS_MAPPING_NAME = "account";

const mutex = new Mutex();

const SYNS_BLOCK_INTERVAL = 1000;

// only for popup thread
export class AleoService {
  config: AleoConfig;
  chainId: string;
  aleoStorage: IAleoStorage;
  rpcService: AleoRpcService;
  cachedSyncBlock: AleoAddressInfo | null = null;
  lastSyncBlockTime: number = 0;

  constructor(config: AleoConfig, storage: IAleoStorage) {
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = storage;
    this.rpcService = new AleoRpcService({ configs: config.rpcList });
  }

  private syncBlocks = async (
    address: string,
  ): Promise<AleoAddressInfo | null> => {
    const release = await mutex.acquire();
    try {
      const addressInfo = await this.aleoStorage.getAddressInfo(
        this.chainId,
        address,
      );

      const blockRanges = await this.aleoStorage.getAleoBlockRanges(
        this.chainId,
        address,
      );

      if (blockRanges.length === 0) {
        return null;
      }
      blockRanges.sort((range1, range2) => {
        const [start1] = range1.split("-");
        const [start2] = range2.split("-");
        return parseInt(start1) - parseInt(start2);
      });

      const allRecordsMap: {
        [program in string]?: {
          [commitment in string]?: RecordDetailWithSpent;
        };
      } = addressInfo?.recordsMap ?? {};
      const allSpentRecordTagsSet = addressInfo?.spentRecordTags
        ? new Set(addressInfo.spentRecordTags)
        : new Set<string>();
      const allTxInfoList = addressInfo?.txInfoList ?? [];
      let [existBegin, existEnd] = addressInfo?.range ?? [];

      for (let i = 0; i < blockRanges.length; i += 1) {
        const blockRange = blockRanges[i];
        const blockInfo = await this.aleoStorage.getAleoBlockInfo(
          this.chainId,
          address,
          blockRange,
        );

        if (!blockInfo) {
          logger.error(
            "===> getBalance blockInfo is null",
            this.chainId,
            address,
            blockRange,
          );
          continue;
        }
        const { recordsMap, txInfoList, spentRecordTags, range } = blockInfo;
        const [blockBegin, blockEnd] = range;
        if (existBegin !== undefined && existEnd !== undefined) {
          existBegin = Math.min(existBegin, blockBegin);
          existEnd = Math.max(existEnd, blockEnd);
        } else {
          existBegin = blockBegin;
          existEnd = blockEnd;
        }
        if (spentRecordTags) {
          for (const spentRecordTag of spentRecordTags) {
            for (const tag of spentRecordTag.tags) {
              allSpentRecordTagsSet.add(tag);
            }
          }
        }
        for (const [programId, records] of Object.entries(recordsMap)) {
          if (!records || records.length === 0) {
            continue;
          }
          const newRecords = allRecordsMap[programId] ?? {};
          for (const record of records) {
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
        allTxInfoList.push(...txInfoList);
      }
      for (const [programId, recordsMap] of Object.entries(allRecordsMap)) {
        if (!recordsMap) {
          continue;
        }
        const records = Object.values(recordsMap);
        if (!records || records.length === 0) {
          continue;
        }
        for (const [commitment, record] of Object.entries(recordsMap)) {
          if (!record) {
            continue;
          }
          if (record.spent) {
            allSpentRecordTagsSet.delete(record.tag);
            continue;
          }
          const spent = allSpentRecordTagsSet.has(record.tag);
          if (spent) {
            allSpentRecordTagsSet.delete(record.tag);
          }
          recordsMap[commitment] = {
            ...record,
            spent,
          };
        }

        allRecordsMap[programId] = recordsMap;
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
        txInfoList: uniqBy(allTxInfoList, (tx) => tx.txId).sort(
          (tx1, tx2) => tx2.height - tx1.height,
        ),
        spentRecordTags: Array.from(allSpentRecordTagsSet),
        range: [existBegin, existEnd],
      };

      console.log("===> syncBlocks result: ", result);

      await this.aleoStorage.setAddressInfo(this.chainId, address, result);

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
      this.cachedSyncBlock = await this.syncBlocks(address);
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
      // const { transition } = fee;
      // const { inputs } = transition;
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

  async getRecords(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
  ): Promise<RecordDetailWithSpent[]> {
    const result = await this.debounceSyncBlocks(address);

    if (!result) {
      return [];
    }

    const records = Object.values(result.recordsMap[programId] ?? {}).filter(
      (item) => {
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
      },
    ) as RecordDetailWithSpent[];
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
  ): Promise<AleoOnChainHistoryItem[]> {
    const result = await this.debounceSyncBlocks(address);

    if (!result) {
      return [];
    }

    return result.txInfoList.slice(0, limit).map((txInfo) => {
      const lastTransition = txInfo.transitions[txInfo.transitions.length - 1];
      return {
        type: AleoHistoryType.ON_CHAIN,
        txId: txInfo.txId,
        programId: lastTransition.program,
        functionName: lastTransition.function,
        amount: lastTransition.amount,
        height: txInfo.height,
        timestamp: txInfo.timestamp,
        addressType: lastTransition.txType,
        status: AleoTxStatus.FINALIZD,
      };
    });
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  private async getTxInfoOnChain(txId: string): Promise<AleoTransaction> {
    return await this.rpcService.currInstance().getTransaction(txId);
  }

  async getLocalTxHistory(address: string): Promise<AleoLocalHistoryItem[]> {
    const chainTxList: AleoLocalHistoryItem[] = [];

    const localIds = await this.aleoStorage.getAddressLocalTxIds(
      this.chainId,
      address,
    );

    await Promise.all(
      localIds.map(async (localId) => {
        const txInfo = await this.aleoStorage.getAddressLocalTx(
          this.chainId,
          address,
          localId,
        );
        if (!txInfo) {
          return;
        }
        switch (txInfo.status) {
          case AleoTxStatus.QUEUED:
          case AleoTxStatus.GENERATING_PROVER_FILES:
          case AleoTxStatus.GENERATING_TRANSACTION:
          case AleoTxStatus.BROADCASTING: {
            chainTxList.push({
              type: AleoHistoryType.LOCAL,
              localId: localId,
              status: txInfo.status,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
            });
            break;
          }
          case AleoTxStatus.COMPLETED: {
            const txId = txInfo.transaction?.id;
            try {
              if (!txId) {
                console.error("===> Completed txId is null: ", txInfo);
                chainTxList.push({
                  type: AleoHistoryType.LOCAL,
                  localId: localId,
                  status: txInfo.status,
                  programId: txInfo.programId,
                  functionName: txInfo.functionName,
                  inputs: txInfo.inputs,
                  timestamp: txInfo.timestamp,
                  addressType: AleoTxAddressType.SEND,
                  amount: txInfo.amount,
                });
                break;
              }
              const tx = await this.getTxInfoOnChain(txId);
              if (!tx) {
                chainTxList.push({
                  type: AleoHistoryType.LOCAL,
                  localId: localId,
                  status: txInfo.status,
                  programId: txInfo.programId,
                  functionName: txInfo.functionName,
                  inputs: txInfo.inputs,
                  timestamp: txInfo.timestamp,
                  addressType: AleoTxAddressType.SEND,
                  amount: txInfo.amount,
                  txId,
                });
              } else {
                chainTxList.push({
                  type: AleoHistoryType.LOCAL,
                  localId: localId,
                  status: AleoTxStatus.FINALIZD,
                  programId: txInfo.programId,
                  functionName: txInfo.functionName,
                  inputs: txInfo.inputs,
                  timestamp: txInfo.timestamp,
                  addressType: AleoTxAddressType.SEND,
                  amount: txInfo.amount,
                  txId,
                });
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
                await this.aleoStorage.setAddressLocalTx(
                  this.chainId,
                  address,
                  {
                    ...txInfo,
                    error: errorMsg,
                    status: AleoTxStatus.REJECTED,
                  },
                );
                chainTxList.push({
                  type: AleoHistoryType.LOCAL,
                  localId: localId,
                  status: AleoTxStatus.REJECTED,
                  programId: txInfo.programId,
                  functionName: txInfo.functionName,
                  inputs: txInfo.inputs,
                  error: errorMsg,
                  timestamp: txInfo.timestamp,
                  addressType: AleoTxAddressType.SEND,
                  amount: txInfo.amount,
                  txId,
                });
              } else {
                chainTxList.push({
                  type: AleoHistoryType.LOCAL,
                  localId: localId,
                  status: txInfo.status,
                  programId: txInfo.programId,
                  functionName: txInfo.functionName,
                  inputs: txInfo.inputs,
                  timestamp: txInfo.timestamp,
                  addressType: AleoTxAddressType.SEND,
                  amount: txInfo.amount,
                  txId,
                });
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
                localId,
              );
            } else {
              chainTxList.push({
                type: AleoHistoryType.LOCAL,
                localId: localId,
                status: txInfo.status,
                programId: txInfo.programId,
                functionName: txInfo.functionName,
                inputs: txInfo.inputs,
                error: txInfo.error,
                timestamp: txInfo.timestamp,
                addressType: AleoTxAddressType.SEND,
                amount: txInfo.amount,
              });
            }
            break;
          }
          case AleoTxStatus.FINALIZD: {
            chainTxList.push({
              type: AleoHistoryType.LOCAL,
              localId: localId,
              txId: txInfo.transaction?.id,
              status: txInfo.status,
              programId: txInfo.programId,
              functionName: txInfo.functionName,
              inputs: txInfo.inputs,
              timestamp: txInfo.timestamp,
              addressType: AleoTxAddressType.SEND,
              amount: txInfo.amount,
            });
            break;
          }
        }
      }),
    );

    return chainTxList;
  }

  async getTxHistory(address: string): Promise<AleoHistoryItem[]> {
    const [onChainTxList, localTxList] = await Promise.all([
      this.getOnChainTxHistory(address),
      this.getLocalTxHistory(address),
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
      [...onChainTxList, ...finishedLocalTxList],
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
}
