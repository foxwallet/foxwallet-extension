import { initThreadPool } from "@aleohq/sdk";
import { expose } from "comlink";
import type { LogFunc } from "./aleo.di";
import type { AleoSendTxParams } from "../../core/coins/ALEO/types/Tranaction";
import { AleoTxWorker } from "./aleo_tx";
import { ReserveChainConfigs } from "./env";

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

addEventListener("message", async (event) => {
  try {
    initAleoTxWorker(ReserveChainConfigs.aleo_testnet_3.rpcList, true);
    const result = await sendTransaction(event.data.payload);
    postMessage({ data: result, error: null });
  } catch (err) {
    postMessage({ data: null, error: (err as Error).message });
  }
});

if (!inited) {
  inited = true;
  postMessage({ type: "inited" });
}