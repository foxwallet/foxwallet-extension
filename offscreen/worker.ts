import init, { PrivateKey } from "aleo_wasm";
import { expose } from "comlink";
import { SyncBlockParams } from "./aleo.di";
import { AleoWorker } from "./aleo";

let aleoWorker: AleoWorker | null = null;

async function initWasm() {
  await init();
}

async function initAleoWorker(rpcList: string[]) {
  if (!aleoWorker) {
    aleoWorker = new AleoWorker(rpcList);
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

const workerAPI = {
  initWasm,
  initAleoWorker,
  getPrivateKey,
  syncBlocks,
};

export type WorkerAPI = typeof workerAPI;

expose(workerAPI);
