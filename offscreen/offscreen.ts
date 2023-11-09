import { wrap, proxy } from "comlink";
import browser from "webextension-polyfill";
import type { WorkerAPI } from "./worker";
import { logger } from "@/common/utils/logger";
import {
  type AleoWorkerMessage,
  AleoWorkerMethod,
  type SyncBlockParams,
  type SyncBlockResp,
  type TaskParams,
} from "./aleo.di";
import { ALEO_BATCH_SIZE } from "@/common/constants";
import localForage from "localforage";

export const aleoBlockStorageInstance = localForage.createInstance({
  driver: localForage.INDEXEDDB,
});

const enableMeasure = true;

const workerNumber = navigator.hardwareConcurrency ?? 4;

const workerList: WorkerAPI[] = [];
const taskQuene: Array<SyncBlockParams & TaskParams & { timestamp: number }> =
  [];
const taskInProcess: Array<Promise<void> | undefined> = new Array<
  Promise<void> | undefined
>(workerNumber);
const storageMap = new Map<string, LocalForage>();
// const taskProcessMap = new Map<
//   number,
//   {
//     totalTask: number;
//     taskFinished: number;
//     taskInProcess: number;
//     averageTime?: number;
//   }
// >();

// let singletonWorker: WorkerAPI | null = null;

export function mainLogger(type: "log" | "error", ...args: any[]) {
  if (type === "error") {
    console.error("===> [WORKER]: ", ...args);
  } else {
    console.log("===> [WORKER]: ", ...args);
  }
}

const getAleoStorageInstance = (chainId: string, address: string) => {
  const key = `${chainId}-${address}`;
  const existInstance = storageMap.get(key);
  if (existInstance) {
    return existInstance;
  }
  const newInstance = aleoBlockStorageInstance.createInstance({
    name: chainId,
    storeName: address,
  });
  storageMap.set(key, newInstance);
  return newInstance;
};

const createAleoWorker = async () => {
  const rawWorker = new Worker(new URL("worker.js", import.meta.url), {
    type: "module",
  });
  const worker = wrap<WorkerAPI>(rawWorker);
  const proxyLogger = proxy(mainLogger);
  await worker.setLogger(proxyLogger);
  return worker;
};

async function initWorker(
  rpcList: string[],
  enableMeasure: boolean,
  sendResponse: (param: any) => void,
) {
  for (let i = workerList.length; i < workerNumber; i++) {
    const aleoWorker = await createAleoWorker();
    await aleoWorker.initWasm();
    await aleoWorker.initAleoWorker(i, rpcList, enableMeasure);
    workerList[i] = aleoWorker;
    console.log("===> spawen worker: ", i);
  }
  sendResponse({ error: null, data: true });
}

// async function getPrivateKey(sendResponse: (param: any) => void) {
//   const aleoWorker = createAleoWorker();
//   await aleoWorker.initWasm();
//   const privateKey = await aleoWorker.getPrivateKey();
//   sendResponse({ error: null, data: privateKey });
// }

async function getProcess(taskId: number) {}

async function executeSyncBlocks(params: SyncBlockParams & TaskParams) {
  const {
    viewKey,
    address,
    chainId,
    begin,
    end,
    taskId,
    taskName,
    priority,
    timestamp,
  } = params;
  console.log("===> executeSyncBlocks: ", begin, end);
  const step = ALEO_BATCH_SIZE;
  let count = 0;
  for (let i = end; i >= begin; i -= step) {
    taskQuene.push({
      taskId,
      taskName,
      priority,
      timestamp,
      viewKey,
      address,
      chainId,
      begin: Math.max(begin, i - step + 1),
      end: i,
    });
    count += 1;
  }
  // taskProcessMap.set(taskId, {
  //   totalTask: count,
  //   taskFinished: 0,
  //   taskInProcess: 0,
  // });
  return new Promise<SyncBlockResp[]>((resolve, reject) => {
    const result: SyncBlockResp[] = [];
    const assignTask = (workerId: number, worker: WorkerAPI) => {
      // sort the task
      taskQuene.sort((task1, task2) => {
        if (task1.priority !== task2.priority) {
          // high priority first
          return task1.priority - task2.priority;
        } else if (task1.timestamp !== task2.timestamp) {
          // older task first
          return task1.timestamp - task2.timestamp;
        } else {
          // new block first
          return task2.begin - task1.begin;
        }
      });
      const task = taskQuene.shift();
      if (!task) {
        // No running task, resolve
        if (taskInProcess.every((task) => !task)) {
          resolve(result);
        }
        // No task, return wait for other worker
        return;
      }
      const { viewKey, begin: taskBegin, end: taskEnd, ...taskInfo } = task;
      // const processMap = taskProcessMap.get(taskId);
      // if (!processMap) {
      //   console.error(`===> ${taskId} processMap doesn't exist`);
      // } else {
      //   taskProcessMap.set(taskId, {
      //     ...processMap,
      //     taskInProcess: processMap.taskInProcess + 1,
      //   });
      // }
      taskInProcess[workerId] = worker
        .syncBlocks({
          viewKey,
          address,
          chainId,
          begin: taskBegin,
          end: taskEnd,
        })
        .then((resp) => {
          if (!resp) {
            taskQuene.push({
              viewKey,
              begin: taskBegin,
              end: taskEnd,
              ...taskInfo,
            });
          } else {
            const {
              range,
              recordsMap,
              txInfoList,
              spentRecordTags,
              measureMap,
            } = resp;
            const [finishBegin] = range;
            if (finishBegin > taskBegin) {
              taskQuene.push({
                viewKey,
                begin: taskBegin,
                end: finishBegin - 1,
                ...taskInfo,
              });
            }
            // store finish data
            if (finishBegin <= taskEnd) {
              result.push({
                range,
                recordsMap,
                txInfoList,
                spentRecordTags,
                measureMap,
              });
            }
          }
        })
        .catch((err) => {
          console.log("===> syncBlocks error: ", err);
          taskQuene.push({
            viewKey,
            begin: taskBegin,
            end: taskEnd,
            ...taskInfo,
          });
        })
        .finally(() => {
          // free the worker
          taskInProcess[workerId] = undefined;
          // assign next task
          assignTask(workerId, worker);
        });
    };
    workerList.forEach((worker, workerId) => {
      assignTask(workerId, worker);
    });
  });
}

function mergeBlocksResult(list: SyncBlockResp[]): SyncBlockResp[] {
  list.sort((item1, item2) => {
    const [begin1] = item1.range;
    const [begin2] = item2.range;
    return begin1 - begin2;
  });

  return list.reduce<SyncBlockResp[]>((prev, curr) => {
    if (prev.length === 0) {
      return [curr];
    }
    const {
      recordsMap: lastRecordsMap,
      spentRecordTags: lastSpentRecordTags,
      txInfoList: lastTxInfoList,
      measureMap: lastMeasureMap,
      range: lastRange,
    } = prev[prev.length - 1];
    const { recordsMap, spentRecordTags, txInfoList, measureMap, range } = curr;
    // Didn't overlap
    if (range[0] !== lastRange[1] + 1) {
      return [...prev, curr];
    }
    for (const [key, value] of Object.entries(recordsMap)) {
      if (!value) {
        continue;
      }
      const existRecords = lastRecordsMap[key];
      if (!existRecords) {
        lastRecordsMap[key] = [...value];
      } else {
        lastRecordsMap[key] = [...existRecords, ...value];
      }
    }
    for (const [key, value] of Object.entries(measureMap)) {
      const existMeasure = lastMeasureMap[key];
      if (!existMeasure) {
        lastMeasureMap[key] = { ...value };
      } else {
        lastMeasureMap[key] = {
          time: (existMeasure.time + value.time) / 2,
          max: Math.max(existMeasure.max, value.max),
          count: existMeasure.count + value.count,
        };
      }
    }
    const merged = {
      recordsMap: lastRecordsMap,
      spentRecordTags: [
        ...(lastSpentRecordTags ?? []),
        ...(spentRecordTags ?? []),
      ],
      txInfoList: [...lastTxInfoList, ...txInfoList],
      measureMap: lastMeasureMap,
      range: [lastRange[0], range[1]],
    };
    prev[prev.length - 1] = merged;
    return prev;
  }, []);
}

async function syncBlocks(
  params: SyncBlockParams & TaskParams,
  sendResponse: (param: any) => void,
) {
  try {
    const startTime = performance.now();
    const { begin, end, address, chainId } = params;
    const result = await executeSyncBlocks(params);
    const totalTime = performance.now() - startTime;
    console.log("===> syncBlocks totalTime: ", totalTime);
    const formatResult = mergeBlocksResult(result);
    const accountStorage = getAleoStorageInstance(chainId, address);
    for (const item of formatResult) {
      const key = `${begin}-${end}`;
      await accountStorage.setItem(key, item);
    }

    sendResponse({ error: null, data: formatResult });
  } catch (err) {
    logger.log("==> err: ", err);
    if (err instanceof Error) {
      sendResponse({ error: err.message });
    }
  }
}

browser.runtime.onMessage.addListener(handleMessages);

function handleMessages(
  message: AleoWorkerMessage,
  sender: browser.Runtime.MessageSender,
  sendResponse: (param: any) => void,
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen") {
    return;
  }

  switch (message.type) {
    case AleoWorkerMethod.INIT_WORKER: {
      initWorker(message.params, enableMeasure, sendResponse).catch((err) => {
        logger.log(`==> ${message.type} err: `, err);
        if (err instanceof Error) {
          sendResponse({ error: err.message });
        }
      });
      return true;
    }
    // case AleoWorkerMethod.GET_PRIVATE_KEY: {
    //   getPrivateKey(sendResponse).catch((err) => {
    //     logger.log(`==> ${message.type} err: `, err);
    //     if (err instanceof Error) {
    //       sendResponse({ error: err.message });
    //     }
    //   });
    //   return true;
    // }
    case AleoWorkerMethod.SYNC_BLOCKS: {
      const params = message.params as SyncBlockParams & TaskParams;
      syncBlocks(params, sendResponse).catch((err) => {
        logger.log(`==> ${message.type} err: `, err);
        if (err instanceof Error) {
          sendResponse({ error: err.message });
        }
      });
      return true;
    }
    default: {
      logger.warn(`Unexpected message type received'.`);
    }
  }
}
