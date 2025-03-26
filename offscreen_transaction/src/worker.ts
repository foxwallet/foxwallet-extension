import { initThreadPool } from "@aleohq/wasm";
import type { AleoSendTxParams } from "../../core/coins/ALEO/types/Transaction";
import { AleoTxWorker } from "./transaction";
import { type AleoRequestDeploymentParams } from "./types";

let aleoTxWorker: AleoTxWorker | null = null;
let inited = false;

await initThreadPool();

const taskQuene: Array<{
  taskType: "sendTx" | "deploy";
  payload: any;
}> = [];

function initAleoTxWorker(rpcList: string[], enableMeasure: boolean) {
  if (!aleoTxWorker) {
    aleoTxWorker = new AleoTxWorker(0, rpcList, enableMeasure);
  }
  return true;
}

async function sendTransaction(params: AleoSendTxParams) {
  if (!aleoTxWorker) {
    throw new Error("aleoTxWorker not init");
  }
  return await aleoTxWorker.sendTransaction(params);
}

async function deploy(params: AleoRequestDeploymentParams) {
  if (!aleoTxWorker) {
    throw new Error("aleoTxWorker not init");
  }
  return await aleoTxWorker.deploy(params);
}

addEventListener("message", (event) => {
  const data = event.data;
  taskQuene.push({
    taskType: data.type,
    payload: data.payload,
  });
});

if (!inited) {
  inited = true;
  postMessage({ type: "inited" });
}

async function executeTask() {
  let flagExit = false;
  while (!flagExit) {
    const task = taskQuene.shift();
    console.log("===> execute task: ", task);
    if (!task) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      continue;
    }
    const { taskType, payload } = task;
    try {
      switch (taskType) {
        case "sendTx": {
          const { rpcList } = payload;
          initAleoTxWorker(rpcList, true);
          const result = await sendTransaction(payload);
          postMessage({ data: result?.id, error: null });
          break;
        }
        case "deploy": {
          const { rpcList } = payload;
          initAleoTxWorker(rpcList, true);
          const result = await deploy(payload);
          postMessage({ data: result?.id, error: null });
          break;
        }
      }
    } catch (err) {
      postMessage({ data: null, error: (err as Error).message });
    } finally {
      if (taskQuene.length === 0) {
        // wait 2s for possible task
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (taskQuene.length === 0) {
          postMessage({ type: "finished" });
          flagExit = true;
        }
      }
    }
  }
}

void executeTask();
