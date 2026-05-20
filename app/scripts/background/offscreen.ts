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
  OFFSCREEN_SCANNER_PATH,
  OFFSCREEN_SYNC_PATH,
  OFFSCREEN_TX_PATH,
  closeOffscreen,
  currentOffscreenPath,
  hasDocument,
  withOffscreen,
} from "./offscreenLock";

const SYNC_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.WORKERS,
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const SYNC_JUSTIFICATION = "Syncing aleo blocks";

const TX_REASONS: chrome.offscreen.Reason[] = [
  chrome.offscreen.Reason.WORKERS,
  chrome.offscreen.Reason.LOCAL_STORAGE,
];
const TX_JUSTIFICATION = "Sending aleo transaction";

// In-process "a tx/deploy broadcast is happening" signal. Mutated only by
// trackTx below. Scanner reads this to wait for tx completion before
// touching the offscreen slot — see scannerOffscreen.ts.
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

export async function stopSync() {
  await closeOffscreen(OFFSCREEN_SYNC_PATH);
}

export async function stopSending() {
  await closeOffscreen(OFFSCREEN_TX_PATH);
}

export async function isSyncingBlocks() {
  return hasDocument(OFFSCREEN_SYNC_PATH);
}

export async function syncBlocks() {
  // INIT_WORKER must be sent on the same offscreen document that ensure
  // brought up — otherwise a scanner/tx flow that grabs the lock between
  // ensure and sendMessage will receive the wrong-origin message and
  // silently drop it, leaving sync's MainLoop unstarted. INIT_WORKER on
  // the offscreen side is idempotent (loopStarted guard in
  // offscreen_sync/index.ts), so repeat calls under the lock are safe.
  return withOffscreen(
    OFFSCREEN_SYNC_PATH,
    SYNC_REASONS,
    SYNC_JUSTIFICATION,
    async () => {
      console.log("===> initWorker sendMessage");
      const messsage: BackgroundMessage = {
        type: OffscreenMethod.INIT_WORKER,
        origin: MessageOrigin.BACKGROUND_TO_OFFSCREEN,
        payload: null,
      };
      const initResp = await chrome.runtime.sendMessage(messsage);
      console.log("===> initWorker resp: ", initResp);
      return initResp;
    },
  );
}

export async function restartSyncBlocks() {
  try {
    await syncBlocks();
  } catch (err) {
    console.error("restart aleo sync failed: ", err);
  }
}

export async function sendAleoTransaction(params: AleoSendTxParams) {
  return trackTx(async () => {
    stopCheckSyncing();
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
      await restartSyncBlocks();
      startCheckSyncing();
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
    await restartSyncBlocks();
  }
  return delayStatus;
}

export async function sendDeployment(params: AleoRequestDeploymentParams) {
  return trackTx(async () => {
    stopCheckSyncing();
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
      await restartSyncBlocks();
      startCheckSyncing();
    }
  });
}

const makeSureSyncing = () => {
  let interval = 5000;
  let timer: NodeJS.Timeout | null = null;

  const checkSyncing = async () => {
    try {
      // Don't preempt a tx or scanner flow that's currently holding the
      // single-offscreen slot. The cache snapshot here is fast; the
      // mutex inside ensureOffscreen still protects against a TOCTOU
      // race with a flow that grabs the lock after our check.
      const path = currentOffscreenPath();
      if (path === OFFSCREEN_TX_PATH || path === OFFSCREEN_SCANNER_PATH) {
        console.log("===> checkSyncing: skip, active path = ", path);
        return;
      }
      const [isSyncing, isSending] = await Promise.all([
        isSyncingBlocks(),
        isSendingAleoTransaction(),
      ]);
      console.log(
        "===> checkSyncing: isSyncingBlocks, isSendingTx ",
        isSyncing,
        isSending,
      );
      if (!isSyncing && !isSending) {
        await syncBlocks();
      }
    } catch (error) {
      console.error("Error while checking syncing status:", error);
    }
  };

  const startCheckSyncing = () => {
    console.log("===> startCheckSyncing ", timer, interval);
    if (timer !== null) return;

    timer = setInterval(async () => {
      await checkSyncing();
      if (interval !== 60 * 1000) {
        interval = 60 * 1000;
        resetTimer();
      }
    }, interval);
  };

  const stopCheckSyncing = () => {
    console.log("===> stopCheckSyncing ", timer, interval);
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const resetTimer = () => {
    stopCheckSyncing();
    startCheckSyncing();
  };

  return {
    startCheckSyncing,
    stopCheckSyncing,
  };
};

export const { startCheckSyncing, stopCheckSyncing } = makeSureSyncing();
