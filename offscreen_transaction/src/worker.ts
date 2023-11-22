import { initThreadPool } from "@aleohq/wasm";
import type { AleoSendTxParams } from "../../core/coins/ALEO/types/Tranaction";
import { AleoTxWorker } from "./transaction";
import { AleoRequestDeploymentParams } from "./types";

let aleoTxWorker: AleoTxWorker | null = null;
let inited = false;

await initThreadPool();

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

addEventListener("message", async (event) => {
  try {
    switch (event.data.type) {
      case "sendTx": {
        const { rpcList } = event.data.payload;
        initAleoTxWorker(rpcList, true);
        const result = await sendTransaction(event.data.payload);
        postMessage({ data: result, error: null });
        return;
      }
      case "deploy": {
        const { rpcList } = event.data.payload;
        initAleoTxWorker(rpcList, true);
        const result = await deploy(event.data.payload);
        postMessage({ data: result, error: null });
        return;
      }
    }
  } catch (err) {
    postMessage({ data: null, error: (err as Error).message });
  }
});

if (!inited) {
  inited = true;
  postMessage({ type: "inited" });
}
