import init, { PrivateKey } from "aleo_wasm";
import { expose } from "comlink";
import type { LogFunc, SyncBlockParams } from "./aleo.di";
import { AleoWorker } from "./aleo";

let aleoWorker: AleoWorker | null = null;

async function initWasm() {
  await init();
}

async function initAleoWorker(workerId: number, rpcList: string[]) {
  if (!aleoWorker) {
    aleoWorker = new AleoWorker(workerId, rpcList);
  }
  return true;
}

async function getPrivateKey() {
  const privateKey = new PrivateKey();
  return privateKey.to_string();
}

async function syncBlocks(params: SyncBlockParams) {
  if (!aleoWorker) {
    throw new Error("aleoWorker not init");
  }
  return await aleoWorker.syncBlocks(params);
}

function setLogger(cb: LogFunc) {
  AleoWorker.setLogger(cb);
}

const workerAPI = {
  initWasm,
  initAleoWorker,
  getPrivateKey,
  syncBlocks,
  setLogger,
};

export type WorkerAPI = typeof workerAPI;

expose(workerAPI);
