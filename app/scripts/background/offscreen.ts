import { AleoRequestDeploymentParams } from "core/coins/ALEO/types/Deployment";
import { ReserveChainConfigs } from "../../../env";
import {
  type BackgroundMessage,
  MessageOrigin,
  OffscreenMethod,
  OffscreenMessage,
} from "../../../offscreen_service/src/types";
import { AleoSendTxParams } from "core/coins/ALEO/types/Transaction";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  OFFSCREEN_PATH,
  closeOffscreen,
  hasDocument,
  withOffscreen,
} from "./offscreenLock";

const TX_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.WORKERS,
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const TX_JUSTIFICATION = "Sending aleo transaction";
const TX_READY_TIMEOUT_MS = 30 * 1000;
const TX_READY_POLL_INTERVAL_MS = 200;

// In-process "a tx/deploy broadcast is happening" signal. Mutated only by
// trackTx below, so status checks can return true even before the offscreen
// listener has answered its first message.
let txInFlight: Promise<unknown> | null = null;

export function getTxInFlight(): Promise<unknown> | null {
  return txInFlight;
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

async function waitForTxOffscreenReady(): Promise<void> {
  const timeoutAt = Date.now() + TX_READY_TIMEOUT_MS;

  while (Date.now() < timeoutAt) {
    try {
      const message: BackgroundMessage = {
        type: OffscreenMethod.IS_SENDING_TX,
        origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN_TX,
        payload: {},
      };
      const resp = (await chrome.runtime.sendMessage(message)) as
        | OffscreenMessage
        | undefined;
      if (resp?.payload && !resp.payload.error) {
        return;
      }
    } catch {
      // The document can exist before its module has registered the listener.
    }

    await sleep(TX_READY_POLL_INTERVAL_MS);
  }

  throw new Error("tx offscreen did not become ready in time");
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
  await closeOffscreen(OFFSCREEN_PATH);
}

export async function sendAleoTransaction(params: AleoSendTxParams) {
  return trackTx(async () => {
    try {
      return await withOffscreen(
        OFFSCREEN_PATH,
        TX_REASONS,
        TX_JUSTIFICATION,
        async () => {
          await waitForTxOffscreenReady();
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
    const msg = String((err as Error)?.message ?? err);
    if (!msg.includes("Receiving end does not exist")) {
      console.error("===> getSendingTxStatus error: ", err);
    }
    return false;
  }
}

export async function isSendingAleoTransaction() {
  if (txInFlight) {
    return true;
  }

  const has = await hasDocument(OFFSCREEN_PATH);
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
      if (txInFlight) {
        resolve(true);
        return;
      }
      const status = await getSendingTxStatus();
      resolve(status);
    }, 2000);
  });
  console.log("===> isSendingAleoTransaction: ", status, delayStatus);
  if (!delayStatus && !txInFlight) {
    await stopSending();
  }
  return delayStatus;
}

export async function sendDeployment(params: AleoRequestDeploymentParams) {
  return trackTx(async () => {
    try {
      return await withOffscreen(
        OFFSCREEN_PATH,
        TX_REASONS,
        TX_JUSTIFICATION,
        async () => {
          await waitForTxOffscreenReady();
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
    }
  });
}
