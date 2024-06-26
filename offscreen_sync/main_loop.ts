import { AutoSwitch, AutoSwitchServiceType } from "core/utils/retry";
import { sleep } from "core/utils/sleep";
import { type WorkerAPI } from "./worker";
import { proxy, wrap } from "comlink";
import {
  ALEO_SYNC_RECORD_SIZE,
  ALEO_WORKER_TASK_SIZE,
} from "@/common/constants";
import {
  type BackgroundMessage,
  MessageOrigin,
  type OffscreenMessage,
  OffscreenMessageType,
} from "@/common/types/offscreen";
import browser from "webextension-polyfill";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import type { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import {
  type SyncRecordParams,
  type TaskParamWithRange,
  TaskPriority,
  SyncRecordResult,
} from "core/coins/ALEO/types/SyncTask";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { AleoRpcService } from "core/coins/ALEO/service/instances/rpc";
import { AccountSettingStorage } from "@/scripts/background/store/account/AccountStorage";
import { CoinType } from "core/types";
import { uniqueIdToAleoChainId } from "core/coins/ALEO/utils/chainId";
import { AleoApiService } from "core/coins/ALEO/service/instances/sync";
import { Mutex } from "async-mutex";

// larger limit
export const SYNC_TASK_QUENE_LIMIT = 100;

const ENABLE_MEASURE = true;

const CHAIN_ID = ALEO_CHAIN_CONFIGS.TESTNET.chainId;

const WORKER_NUMBER = Math.min(
  Math.max((navigator.hardwareConcurrency ?? 4) - 1, 4),
  8,
);

const mutex = new Mutex();

export class MainLoop {
  static instance: MainLoop;
  onLine: boolean;
  apiService: AleoApiService;
  syncTaskQuene: Array<TaskParamWithRange & { syncParams: SyncRecordParams[] }>;
  workerList: WorkerAPI[];
  taskInProcess: Array<Promise<void> | undefined>;
  aleoStorage: AleoStorage;
  accountSettingStorage: AccountSettingStorage;

  static getInstace(apiList: string[]) {
    const cacheInstance = MainLoop.instance;
    if (cacheInstance) {
      return cacheInstance;
    }
    const instance = new MainLoop(apiList);
    MainLoop.instance = instance;
    return instance;
  }

  private constructor(private apiList: string[]) {
    this.onLine = navigator.onLine;
    this.syncTaskQuene = [];
    this.workerList = [];
    this.taskInProcess = new Array<Promise<void> | undefined>(WORKER_NUMBER);
    this.aleoStorage = AleoStorage.getInstance();
    this.apiService = new AleoApiService({
      configs: apiList.map((url) => ({
        url,
        chainId: CHAIN_ID,
      })),
    });
    this.accountSettingStorage = AccountSettingStorage.getInstance();
  }

  async sendMessage(message: OffscreenMessage) {
    return (await browser.runtime.sendMessage(message)) as BackgroundMessage;
  }

  mainLogger = (type: "log" | "error", ...args: any[]) => {
    if (type === "error") {
      console.error("===> [WORKER]: ", ...args);
    } else {
      console.log("===> [WORKER]: ", ...args);
    }
  };

  async createAleoWorker() {
    const rawWorker = new Worker(new URL("worker.js", import.meta.url), {
      type: "module",
    });
    const worker = wrap<WorkerAPI>(rawWorker);
    const proxyLogger = proxy(this.mainLogger);
    await worker.setLogger(proxyLogger);
    return worker;
  }

  async initWorker() {
    for (let i = this.workerList.length; i < WORKER_NUMBER; i++) {
      const aleoWorker = await this.createAleoWorker();
      await aleoWorker.initWasm();
      await aleoWorker.initAleoWorker(i, this.apiList, ENABLE_MEASURE);
      this.workerList[i] = aleoWorker;
      console.log("===> spawen worker: ", i);
    }
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.API })
  async getLatestRecordIndex(chainId: string) {
    this.apiService.currInstance().setChainId(chainId);
    return await this.apiService.currInstance().getLatestRecordIndex();
  }

  async getAccountExistRange(
    chainId: string,
    map: Map<string, string[]>,
    account: AleoSyncAccount,
  ) {
    const { address } = account;
    const key = `${chainId}-${account.address}`;
    const cacheRange = map.get(key);
    if (cacheRange) {
      return cacheRange;
    }
    const ranges = await this.aleoStorage.getAleoRecordRanges(chainId, address);
    map.set(key, ranges ?? []);
    return ranges;
  }

  async initAccountsSyncTask(
    chainId: string,
    accounts: AleoSyncAccount[],
    lastRecordIndex: number,
  ): Promise<{ [key in string]: number }> {
    const accountRangeMap = new Map<string, string[]>();
    const batchMap: { [key in string]: number } = {};
    for (
      let i = Math.floor(lastRecordIndex / ALEO_SYNC_RECORD_SIZE);
      i >= 0;
      i -= 1
    ) {
      const taskWithRange = new Map<string, SyncRecordParams[]>();
      let start;
      let stop;
      for (const account of accounts) {
        const { address, viewKey, priority } = account;

        start = i * ALEO_SYNC_RECORD_SIZE;
        stop = Math.min((i + 1) * ALEO_SYNC_RECORD_SIZE - 1, lastRecordIndex);
        const partRange = `${start}-`;
        const totalRange = `${partRange}${stop}`;

        const ranges = await this.getAccountExistRange(
          chainId,
          accountRangeMap,
          account,
        );
        if (ranges.includes(totalRange)) {
          continue;
        }
        const existRange = ranges.find((range) => range.startsWith(partRange));
        let batchId: string | undefined;
        let addressStart: number | undefined;
        let addressStop: number | undefined;
        if (existRange) {
          const rangeLastHeight = Number(existRange.split("-")[1]);
          if (rangeLastHeight < stop) {
            batchId = existRange;
            addressStart = rangeLastHeight + 1;
            addressStop = stop;
          }
        } else {
          batchId = totalRange;
          addressStart = start;
          addressStop = stop;
        }
        if (
          addressStart !== undefined &&
          addressStop !== undefined &&
          batchId !== undefined
        ) {
          const key = `${addressStart}-${addressStop}`;
          const existTaskList = taskWithRange.get(key) ?? [];
          existTaskList.push({
            viewKey,
            address,
            begin: addressStart,
            end: addressStop,
            batchId,
            priority,
          });
          taskWithRange.set(key, existTaskList);
          batchMap[`${chainId}-${address}-${batchId}`] = 1;

          // let count = 0;
          // for (
          //   let i = Math.ceil(addressStop / ALEO_WORKER_TASK_SIZE);
          //   i * ALEO_WORKER_TASK_SIZE > addressStart;
          //   i -= 1
          // ) {
          //   const normalStart = (i - 1) * ALEO_WORKER_TASK_SIZE;
          //   const normalEnd = i * ALEO_WORKER_TASK_SIZE - 1;
          //   const workerStart = Math.max(addressStart, normalStart);
          //   const workerStop = Math.min(normalEnd, addressStop);
          //   const key = `${normalStart}-${normalEnd}`;
          //   const existTaskList = taskWithRange.get(key) ?? [];
          //   count += 1;
          //   existTaskList.push({
          //     viewKey,
          //     address,
          //     begin: workerStart,
          //     end: workerStop,
          //     batchId,
          //     priority,
          //   });
          //   taskWithRange.set(key, existTaskList);
          // }
          // batchMap[`${chainId}-${address}-${batchId}`] = count;
        }
      }
      if (taskWithRange.size > 0) {
        taskWithRange.forEach((value, key) => {
          const [start, stop] = key.split("-").map((item) => Number(item));
          this.syncTaskQuene.push({
            syncParams: value,
            address: value.map((item) => item.address),
            chainId,
            priority: value.reduce(
              (prev, item) => Math.min(prev, item.priority),
              TaskPriority.LOW,
            ),
            timestamp: Date.now(),
            begin: start,
            end: stop,
          });
        });
      }
      if (this.syncTaskQuene.length >= SYNC_TASK_QUENE_LIMIT) {
        console.log(
          "===> syncTaskQuene reach limit: ",
          this.syncTaskQuene.length,
          SYNC_TASK_QUENE_LIMIT,
          start,
          stop,
          lastRecordIndex,
        );
        break;
      }
    }
    return batchMap;
  }

  mergeBlocksResult(list: SyncRecordResult[]): SyncRecordResult | undefined {
    if (list.length === 0) {
      return undefined;
    }
    console.log("===> mergeBlocksResult: ", list);
    list.sort((item1, item2) => {
      const [begin1] = item1.range;
      const [begin2] = item2.range;
      return begin1 - begin2;
    });
    let lastEnd = -1;
    for (const item of list) {
      const [begin, end] = item.range;
      if (lastEnd === -1) {
        lastEnd = end;
        continue;
      } else if (begin === lastEnd + 1) {
        lastEnd = end;
        continue;
      } else {
        console.error(
          "===> mergeBlocksResult error: list is not continuous ",
          list,
        );
        return undefined;
      }
    }

    return list.reduce<SyncRecordResult>(
      (prev: SyncRecordResult, curr: SyncRecordResult) => {
        const { recordsMap: lastRecordsMap, range: lastRange } = prev;
        const { recordsMap, range } = curr;
        for (const [key, value] of Object.entries(recordsMap)) {
          if (!value) {
            continue;
          }
          const existRecords = lastRecordsMap[key];
          if (!existRecords) {
            lastRecordsMap[key] = { ...value };
          } else {
            for (let [commitment, record] of Object.entries(value)) {
              if (!record) {
                continue;
              }
              if (existRecords[commitment]) {
                continue;
              }
              existRecords[commitment] = record;
            }
            lastRecordsMap[key] = existRecords;
          }
        }
        const merged = {
          recordsMap: lastRecordsMap,
          range: [lastRange[0], range[1]],
        };
        return merged;
      },
      {
        recordsMap: {},
        range: [list[0].range[0], list[0].range[1]],
      },
    );
  }

  async storeBlockResults(
    chainId: string,
    address: string,
    batchId: string,
    results: SyncRecordResult[],
    measureMap: {
      [key in string]: { time: number; max: number; count: number };
    },
  ): Promise<boolean> {
    const release = await mutex.acquire();
    try {
      console.log("===> storeBlockResults batchId: ", batchId, results);
      const formatResult = this.mergeBlocksResult(results);
      if (!formatResult) {
        console.error("===> store syncBlocksResult failed: ", formatResult);
        return false;
      }
      console.log("===> storeBlockResults formatResult: ", formatResult);
      const key = batchId.toString();
      const batchStart = Number(batchId.split("-")[0]);
      const existItem = await this.aleoStorage.getAleoRecordsInfo(
        chainId,
        address,
        key,
      );
      console.log("===> storeBlockResults existItem: ", existItem);
      if (!existItem) {
        if (batchStart !== formatResult.range[0]) {
          console.error(
            "===> storeBlockResult batchStart error: set init block error ",
            batchId,
            formatResult,
            await this.aleoStorage.getAleoRecordRanges(chainId, address),
          );
          return false;
        }
        await this.aleoStorage.setAleoRecords(chainId, address, key, {
          ...formatResult,
          measure: {
            totalTime: measureMap?.totalTime?.time ?? 0,
            requestTime: measureMap?.getRecordsInRange?.time ?? 0,
          },
        });
        return true;
      } else {
        const merged = this.mergeBlocksResult([existItem, formatResult]);
        if (!merged) {
          console.error(
            "===> storeBlockResult merge failed: ",
            batchId,
            existItem,
            formatResult,
          );
          return false;
        }
        const newRange = merged.range;
        const newKey = `${newRange[0]}-${newRange[1]}`;
        if (batchStart !== newRange[0]) {
          console.error(
            "===> storeBlockResult batchStart error: ",
            batchId,
            merged,
            existItem,
          );
          return false;
        }
        const existMeasure = existItem.measure ?? {
          totalTime: 0,
          requestTime: 0,
        };
        const newTotalTime = measureMap?.totalTime?.time ?? 0;
        const newRequestTime = measureMap?.getRecordsInRange?.time ?? 0;
        const newMeasure = { totalTime: 0, requestTime: 0 };
        if (newTotalTime > 0 && newRequestTime > 0) {
          if (!existMeasure?.requestTime && !existMeasure?.totalTime) {
            newMeasure.requestTime = newRequestTime;
            newMeasure.totalTime = newTotalTime;
          } else {
            newMeasure.requestTime =
              (existMeasure.requestTime + newRequestTime) / 2;
            newMeasure.totalTime = (existMeasure.totalTime + newTotalTime) / 2;
          }
        }
        console.log(
          "===> storeBlockResult merged: ",
          merged,
          key,
          newKey,
          newRange,
        );
        // await this.aleoStorage.removeAleoRecords(chainId, address, key);
        console.log("===> storeBlockResult remove: ", key);
        await this.aleoStorage.setAleoRecords(chainId, address, newKey, {
          ...merged,
          range: newRange,
          measure: newMeasure,
        });
        console.log(
          "===> storeBlockResult setAleoRecords: ",
          newKey,
          merged,
          newRange,
          newMeasure,
        );
        return true;
      }
    } finally {
      release();
    }
  }

  async executeSyncBlocks(batchMap: { [key in string]: number }) {
    return new Promise<void>((resolve, reject) => {
      const result: { [batchId in string]?: SyncRecordResult[] } = {};
      const assignTask = (workerId: number, worker: WorkerAPI) => {
        if (!navigator.onLine) {
          return;
        }
        // sort the task
        this.syncTaskQuene.sort((task1, task2) => {
          if (task1.priority !== task2.priority) {
            // high priority first
            return task1.priority - task2.priority;
          } else if (task2.begin !== task1.begin) {
            // new record first
            return task2.begin - task1.begin;
          } else {
            // older task first
            return task1.timestamp - task2.timestamp;
          }
        });
        const task = this.syncTaskQuene.shift();
        if (!task) {
          // No running task, resolve
          if (this.taskInProcess.every((task) => !task)) {
            resolve();
          }
          // No task, return wait for other worker
          return;
        }
        console.log("===> execute task: ", JSON.stringify(task));
        this.taskInProcess[workerId] = worker
          .syncRecords(task)
          .then(async (resp) => {
            console.log(
              "===> finished task: ",
              task,
              JSON.stringify(resp),
              JSON.stringify(batchMap),
            );
            if (!resp) {
              this.syncTaskQuene.push({
                ...task,
              });
            } else {
              const { chainId, addressResultMap, measureMap } = resp;
              const unfinishedTask: SyncRecordParams[] = [];
              for (const params of task.syncParams) {
                const { address } = params;
                const addressResult = addressResultMap[address];
                if (!addressResult) {
                  unfinishedTask.push({
                    ...params,
                  });
                } else {
                  const {
                    viewKey,
                    address,
                    begin: taskBegin,
                    end: taskEnd,
                    batchId,
                    range,
                    recordsMap,
                    priority,
                  } = addressResult;
                  const [finishBegin] = range;
                  const batchKey = `${chainId}-${address}-${batchId}`;
                  if (finishBegin > taskBegin) {
                    if (finishBegin <= taskEnd) {
                      batchMap[batchKey] += 1;
                    }
                    unfinishedTask.push({
                      viewKey,
                      address,
                      begin: taskBegin,
                      end: finishBegin - 1,
                      batchId,
                      priority,
                    });
                  }
                  // store finish data
                  if (finishBegin <= taskEnd) {
                    const resultBatch = result[batchKey] ?? [];
                    batchMap[batchKey] -= 1;
                    resultBatch.push({
                      range,
                      recordsMap,
                    });
                    result[batchKey] = resultBatch;
                    console.log(
                      "===> batchMap: ",
                      JSON.stringify(batchMap),
                      batchKey,
                    );
                    if (batchMap[batchKey] === 0) {
                      console.log("===> store batch: ", batchKey, resultBatch);
                      // store batch data
                      await this.storeBlockResults(
                        chainId,
                        address,
                        batchId,
                        [...resultBatch],
                        measureMap,
                      );
                    }
                  }
                }
              }
              console.log("===> unfinishedTask: ", unfinishedTask);
              if (unfinishedTask.length > 0) {
                const [finalStart, finalStop] = unfinishedTask.reduce(
                  (prev, item) => [
                    Math.min(prev[0], item.begin),
                    Math.max(prev[1], item.end),
                  ],
                  [unfinishedTask[0].begin, unfinishedTask[0].end],
                );
                this.syncTaskQuene.push({
                  ...task,
                  syncParams: unfinishedTask,
                  begin: finalStart,
                  end: finalStop,
                  address: unfinishedTask.map((item) => item.address),
                });
              }
            }
          })
          .catch((err) => {
            console.log("===> syncBlocks error: ", err);
            this.syncTaskQuene.push({ ...task });
          })
          .finally(() => {
            // free the worker
            this.taskInProcess[workerId] = undefined;
            // assign next task
            assignTask(workerId, worker);
          });
      };
      this.workerList.forEach((worker, workerId) => {
        assignTask(workerId, worker);
      });
    });
  }

  private onNetworkOnline = () => {
    console.log("===> online listener: ", navigator.onLine);
    // 当网络在线时触发
    this.onLine = true;
    void this.loop();
  };

  private setNetworkListener() {
    window.addEventListener("online", this.onNetworkOnline);
  }

  async loop(): Promise<void> {
    this.onLine = navigator.onLine;
    if (!this.onLine) {
      console.log("===> network not available", this.onLine);
      this.setNetworkListener();
      return;
    }
    try {
      const addressList = await this.aleoStorage.getAccountsAddress();
      console.log("===> addressList ", addressList.length, addressList);
      const selectedAccount =
        await this.accountSettingStorage.getSelectedAccount(CoinType.ALEO);
      if (!selectedAccount) {
        console.error("selected account not found");
        await sleep(5000);
        return this.loop();
      }
      const accountToSync = await this.aleoStorage.getAccountInfo(
        selectedAccount.address,
      );
      if (!accountToSync) {
        console.error("selected accountViewKey not found");
        await sleep(2000);
        return this.loop();
      }
      const selectedUnqueId =
        await this.accountSettingStorage.getSelectedUniqueId(CoinType.ALEO);
      const chainId = uniqueIdToAleoChainId(selectedUnqueId);
      const lastRecordIndex = await this.getLatestRecordIndex(chainId);
      console.log("===> lastRecordIndex: ", lastRecordIndex);
      if (!lastRecordIndex) {
        // fetch height failed, sleep & retry
        await sleep(10000);
        return this.loop();
      }
      await this.initWorker();
      const batchMap = await this.initAccountsSyncTask(
        chainId,
        [accountToSync],
        lastRecordIndex,
      );
      console.log(
        "===> syncTaskQuene: ",
        JSON.stringify(this.syncTaskQuene),
        JSON.stringify(batchMap),
      );
      if (this.syncTaskQuene.length === 0) {
        // no task, sleep & retry
        await sleep(10000);
        return this.loop();
      }
      await this.executeSyncBlocks(batchMap);
      return this.loop();
    } catch (err) {
      console.log("===> loop err: ", err);
      const errMsg = "loop error: " + (err as Error).message;
      void this.sendMessage({
        type: OffscreenMessageType.ERROR,
        origin: MessageOrigin.OFFSCREEN_TO_BACKGROUND,
        payload: { error: errMsg, data: null },
      });
      // sleep & retry
      await sleep(2000);
      return this.loop();
    }
  }
}
