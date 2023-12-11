import init, { PrivateKey } from "aleo_wasm";
import { expose } from "comlink";
import type { LogFunc } from "./aleo.di";
import { AleoWorker } from "./aleo";
import type { WorkerSyncTask } from "core/coins/ALEO/types/SyncTask";

let aleoWorker: AleoWorker | null = null;
let workerId: number;

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
  AleoWorker.setLogger(cb);
}

async function getWorkerId() {
  return workerId;
}

const workerAPI = {
  initWasm,
  initAleoWorker,
  getPrivateKey,
  syncBlocks,
  setLogger,
  getWorkerId,
};

export type WorkerAPI = typeof workerAPI;

expose(workerAPI);
