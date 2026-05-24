import { AleoRequestDeploymentParams } from "core/coins/ALEO/types/Deployment";
import { ReserveChainConfigs } from "../../../env";
import {
  type BackgroundMessage,
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessage,
} from "../../../offscreen_transaction/src/types";
import { AleoSendTxParams } from "core/coins/ALEO/types/Transaction";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  OFFSCREEN_TX_PATH,
  closeOffscreen,
  hasDocument,
  withOffscreen,
} from "./offscreenLock";

const TX_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.WORKERS,
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const TX_JUSTIFICATION = "Sending aleo transaction";

// In-process "a tx/deploy broadcast is happening" signal. Mutated only by
// trackTx below. Scanner reads this to wait for tx completion before
// touching the offscreen slot. See scannerOffscreen.ts.
let txInFlight: Promise<unknown> | null = null;

export function getTxInFlight(): Promise<unknown> | null {
  return txInFlight;
}

async function trackTx<T>(fn: () => Promise<T>): Promise<T> {
  if (txInFlight) {
    // Two tx requests overlapping: serialize, matching today's behavior
    // where the offscreen mutex already forces this ordering.
    try {
      await txInFlight;
    } catch {
      /* prior tx failure is not ours */
    }
  }
  const p = fn();
  txInFlight = p;
  try {
    return await p;
  } finally {
    if (txInFlight === p) txInFlight = null;
  }
}

export async function stopSending() {
  await closeOffscreen(OFFSCREEN_TX_PATH);
}

export async function sendAleoTransaction(params: AleoSendTxParams) {
  return trackTx(async () => {
    try {
      return await withOffscreen(
        OFFSCREEN_TX_PATH,
        TX_REASONS,
        TX_JUSTIFICATION,
        async () => {
          console.log("===> initWorker sendMessage");
          const messsage: BackgroundMessage = {
            type: OffscreenMethod.SEND_TX,
            origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
            payload: {
              ...params,
              rpcList:
                ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].rpcList,
            },
          };
          const sendTxResp: OffscreenMessage =
            await chrome.runtime.sendMessage(messsage);
          console.log("===> sendTx resp: ", sendTxResp);
          return sendTxResp;
        },
      );
    } catch (err) {
      console.error("sendTransaction failed: ", err);
      return undefined;
    } finally {
      await closeOffscreen(OFFSCREEN_TX_PATH);
    }
  });
}

async function getSendingTxStatus() {
  try {
    const messsage: BackgroundMessage = {
      type: OffscreenMethod.IS_SENDING_TX,
      origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
      payload: {},
    };
    const sendingTxResp: OffscreenMessage =
      await chrome.runtime.sendMessage(messsage);
    console.log("===> sendingTx resp: ", sendingTxResp);
    if (!sendingTxResp?.payload || sendingTxResp?.payload?.error) {
      throw new Error(
        "Get sending status failed " + sendingTxResp?.payload?.error,
      );
    }
    return !!sendingTxResp.payload.data;
  } catch (err) {
    console.error("===> getSendingTxStatus error: ", err);
    return false;
  }
}

export async function isSendingAleoTransaction() {
  const has = await hasDocument(OFFSCREEN_TX_PATH);
  console.log("===> isSendingAleoTransaction has document: ", has);
  if (!has) {
    return false;
  }
  const status = await getSendingTxStatus();
  if (status) {
    return true;
  }
  const delayStatus = await new Promise<boolean>((resolve) => {
    setTimeout(async () => {
      const status = await getSendingTxStatus();
      resolve(status);
    }, 2000);
  });
  console.log("===> isSendingAleoTransaction: ", status, delayStatus);
  if (!delayStatus) {
    await stopSending();
  }
  return delayStatus;
}

export async function sendDeployment(params: AleoRequestDeploymentParams) {
  return trackTx(async () => {
    try {
      return await withOffscreen(
        OFFSCREEN_TX_PATH,
        TX_REASONS,
        TX_JUSTIFICATION,
        async () => {
          console.log("===> initWorker sendMessage");
          const messsage: BackgroundMessage = {
            type: OffscreenMethod.DEPLOY,
            origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
            payload: {
              ...params,
              rpcList:
                ReserveChainConfigs[InnerChainUniqueId.ALEO_MAINNET].rpcList,
            },
          };
          const sendTxResp: OffscreenMessage =
            await chrome.runtime.sendMessage(messsage);
          console.log("===> sendTx resp: ", sendTxResp);
          return sendTxResp;
        },
      );
    } catch (err) {
      console.error("sendDeployment failed: ", err);
      return undefined;
    } finally {
      await closeOffscreen(OFFSCREEN_TX_PATH);
    }
  });
}
