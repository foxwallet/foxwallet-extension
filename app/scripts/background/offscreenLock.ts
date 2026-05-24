import { Mutex } from "async-mutex";
import * as browser from "webextension-polyfill";

export const OFFSCREEN_TX_PATH = "/offscreen_tx.html";
export const OFFSCREEN_SCANNER_PATH = "/offscreen_scanner.html";

export type OffscreenPath =
  | typeof OFFSCREEN_TX_PATH
  | typeof OFFSCREEN_SCANNER_PATH;

const KNOWN_PATHS: readonly OffscreenPath[] = [
  OFFSCREEN_TX_PATH,
  OFFSCREEN_SCANNER_PATH,
];

const lock = new Mutex();

// Single source of truth for which offscreen document we believe is alive.
// Mutated only inside the mutex.
let currentPath: OffscreenPath | null = null;
let reconciled = false;

async function hasDocumentRaw(path: string): Promise<boolean> {
  if ("getContexts" in chrome.runtime) {
    // @ts-expect-error getContexts not in @types/chrome yet
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [browser.runtime.getURL(path)],
    });
    return contexts.length > 0;
  }
  // @ts-expect-error matchAll not in SW types
  const matchedClients = await clients.matchAll();
  // @ts-expect-error client url
  return matchedClients.some((client) =>
    client.url.includes(chrome.runtime.id),
  );
}

// Pure observation. Does not take the lock. Safe to call from any caller
// that just wants to know whether a document is up right now.
export async function hasDocument(path: OffscreenPath): Promise<boolean> {
  return hasDocumentRaw(path);
}

// Must be called inside the mutex. Seeds `currentPath` once per SW lifecycle
// by querying chrome.runtime.getContexts, in case a previous SW instance
// left a document up.
async function reconcileLocked(): Promise<void> {
  if (reconciled) return;
  for (const path of KNOWN_PATHS) {
    if (await hasDocumentRaw(path)) {
      currentPath = path;
      reconciled = true;
      return;
    }
  }
  currentPath = null;
  reconciled = true;
}

async function createLocked(
  target: OffscreenPath,
  reasons: chrome.offscreen.Reason[],
  justification: string,
): Promise<void> {
  await chrome.offscreen.createDocument({
    url: target,
    reasons,
    justification,
  });
  currentPath = target;
}

async function closeLocked(): Promise<void> {
  if (currentPath === null) {
    // Defensive: if reconcile thinks nothing is up but Chrome disagrees,
    // a closeDocument() call will throw "No offscreen document to close";
    // swallow that specific case.
    return;
  }
  try {
    await chrome.offscreen.closeDocument();
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (!msg.includes("No offscreen document")) throw err;
  } finally {
    currentPath = null;
  }
}

// Ensure `target` is the active offscreen document. If a different document
// is up, swap. If `target` is already up, no-op. Returns after the swap.
async function ensureLocked(
  target: OffscreenPath,
  reasons: chrome.offscreen.Reason[],
  justification: string,
): Promise<void> {
  await reconcileLocked();
  if (currentPath === target) return;
  if (currentPath !== null) {
    await closeLocked();
  }
  try {
    await createLocked(target, reasons, justification);
  } catch (err: any) {
    // Re-reconcile from Chrome's perspective and retry once. This handles
    // the case where a different SW instance / extension reload left a
    // stale document we didn't know about.
    const msg = String(err?.message ?? "");
    if (!msg.startsWith("Only a single offscreen")) throw err;
    reconciled = false;
    await reconcileLocked();
    if (currentPath !== null && currentPath !== target) {
      await closeLocked();
    }
    if (currentPath !== target) {
      await createLocked(target, reasons, justification);
    }
  }
}

export async function ensureOffscreen(
  target: OffscreenPath,
  reasons: chrome.offscreen.Reason[],
  justification: string,
): Promise<void> {
  const release = await lock.acquire();
  try {
    await ensureLocked(target, reasons, justification);
  } finally {
    release();
  }
}

export async function withOffscreen<T>(
  target: OffscreenPath,
  reasons: chrome.offscreen.Reason[],
  justification: string,
  fn: () => Promise<T>,
): Promise<T> {
  const release = await lock.acquire();
  try {
    await ensureLocked(target, reasons, justification);
    return await fn();
  } finally {
    release();
  }
}

export async function closeOffscreen(target?: OffscreenPath): Promise<void> {
  const release = await lock.acquire();
  try {
    await reconcileLocked();
    if (currentPath === null) return;
    if (target !== undefined && currentPath !== target) return;
    await closeLocked();
  } finally {
    release();
  }
}
