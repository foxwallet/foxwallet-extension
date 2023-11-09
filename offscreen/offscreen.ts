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

const enableMeasure = true;

const workerNumber = navigator.hardwareConcurrency ?? 4;

const workerList: WorkerAPI[] = [];
const taskQuene: Array<SyncBlockParams & TaskParams & { timestamp: number }> =
  [];
const taskInProcess: Array<Promise<void> | undefined> = new Array<
  Promise<void> | undefined
>(workerNumber);
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
  const { viewKey, begin, end, taskId, taskName, priority, timestamp } = params;
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

function mergeBlocksResult(list: SyncBlockResp[]) {
  return list.reduce<SyncBlockResp & { range: number[][] }>(
    (prev, curr) => {
      const {
        recordsMap: allRecordsMap,
        spentRecordTags: allSpentRecordTags,
        txInfoList: allTxInfoList,
        measureMap: allMeasureMap,
        range: oldRange,
      } = prev;
      const { recordsMap, spentRecordTags, txInfoList, measureMap, range } =
        curr;
      for (const [key, value] of Object.entries(recordsMap)) {
        if (!value) {
          continue;
        }
        const existRecords = allRecordsMap[key];
        if (!existRecords) {
          allRecordsMap[key] = [...value];
        } else {
          allRecordsMap[key] = [...existRecords, ...value];
        }
      }
      for (const [key, value] of Object.entries(measureMap)) {
        const existMeasure = allMeasureMap[key];
        if (!existMeasure) {
          allMeasureMap[key] = { ...value };
        } else {
          allMeasureMap[key] = {
            time: (existMeasure.time + value.time) / 2,
            max: Math.max(existMeasure.max, value.max),
            count: existMeasure.count + value.count,
          };
        }
      }
      oldRange.push(range);
      return {
        recordsMap: allRecordsMap,
        spentRecordTags: [
          ...(allSpentRecordTags ?? []),
          ...(spentRecordTags ?? []),
        ],
        txInfoList: [...allTxInfoList, ...txInfoList],
        measureMap: allMeasureMap,
        range: oldRange,
      };
    },
    {
      recordsMap: {},
      spentRecordTags: [],
      txInfoList: [],
      measureMap: {},
      range: [],
    },
  );
}

async function syncBlocks(
  params: SyncBlockParams & TaskParams,
  sendResponse: (param: any) => void,
) {
  try {
    const startTime = performance.now();
    const result = await executeSyncBlocks(params);
    const totalTime = performance.now() - startTime;
    console.log("===> syncBlocks totalTime: ", totalTime);
    const formatResult = mergeBlocksResult(result);
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
