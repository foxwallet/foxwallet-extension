import init, { PrivateKey } from "aleo_wasm";
import { expose } from "comlink";

async function initWasm() {
    await init();
}

async function getPrivateKey() {
    const privateKey = new PrivateKey();
    return privateKey.to_string();
}

const workerAPI = {
    initWasm,
    getPrivateKey,
};

export type WorkerAPI = typeof workerAPI;

expose(workerAPI);