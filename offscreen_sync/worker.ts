import init, { PrivateKey } from "aleo_wasm";
import { expose } from "comlink";
import type { LogFunc } from "./aleo.di";
import type { AleoSendTxParams } from "core/coins/ALEO/types/Tranaction";
import { AleoWorker } from "./aleo";
import type { WorkerSyncTask } from "core/coins/ALEO/types/SyncTask";
import { AleoTxWorker } from "./aleo_tx";

let aleoWorker: AleoWorker | null = null;
let workerId: number;
let aleoTxWorker: AleoTxWorker | null = null;
let aleoTxWorkerId: number;

async function initWasm() {
  await init();
}

async function initAleoWorker(
  id: number,
  rpcList: string[],
  enableMeasure: boolean,
) {
  if (!aleoWorker) {
    workerId = id;
    aleoWorker = new AleoWorker(id, rpcList, enableMeasure);
  }
  return true;
}

async function initAleoTxWorker(
  id: number,
  rpcList: string[],
  enableMeasure: boolean,
) {
  if (!aleoTxWorker) {
    aleoTxWorkerId = workerId;
    aleoTxWorker = new AleoTxWorker(id, rpcList, enableMeasure);
  }
  return true;
}

async function getPrivateKey() {
  const privateKey = new PrivateKey();
  return privateKey.to_string();
}

async function syncBlocks(params: WorkerSyncTask) {
  if (!aleoWorker) {
    throw new Error("aleoWorker not init");
  }
  return await aleoWorker.beginSyncBlockTask(params);
}

async function setLogger(cb: LogFunc) {
  AleoTxWorker.setLogger(cb);
  AleoWorker.setLogger(cb);
}

async function getWorkerId() {
  return aleoTxWorkerId ?? workerId;
}

async function sendTransaction(params: AleoSendTxParams) {
  if (!aleoTxWorker) {
    throw new Error("aleoTxWorker not init");
  }
  return await aleoTxWorker.sendTransaction(params);
}

const workerAPI = {
  initWasm,
  initAleoWorker,
  initAleoTxWorker,
  getPrivateKey,
  syncBlocks,
  setLogger,
  getWorkerId,
  sendTransaction,
};

export type WorkerAPI = typeof workerAPI;

expose(workerAPI);
