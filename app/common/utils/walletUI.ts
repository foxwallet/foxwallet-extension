export const WALLET_UI_PORT = "wallet_sidepanel";
export const WALLET_PAGES = [
  "index.html",
  "sidepanel.html",
  "notification.html",
];

export function isWalletDocument(
  runtime: { id?: string; getURL: (path: string) => string },
  sender?: { id?: string; url?: string },
) {
  const documentUrl = sender?.url?.split(/[?#]/)[0];
  return (
    sender?.id === runtime.id &&
    WALLET_PAGES.some((page) => documentUrl === runtime.getURL(page))
  );
}

export const isSidePanel = () => window.location.pathname === "/sidepanel.html";

type WalletSidePanel = typeof chrome.sidePanel & {
  close?: () => Promise<void>;
};

export async function closeWalletUI() {
  if (!isSidePanel()) {
    window.close();
    return;
  }

  const sidePanel = chrome.sidePanel as WalletSidePanel;
  try {
    if (sidePanel.close) {
      await sidePanel.close();
    }
  } catch {
    // Some Chrome versions do not expose sidePanel.close yet.
  }
  void chrome.runtime
    .sendMessage({ type: "restore-sidepanel" })
    .catch(() => undefined);
  await sidePanel.setOptions({ enabled: false });
}

export type WalletUIMessage =
  | { type: "confirm-open"; requestId: string; path: string }
  | { type: "confirm-done"; requestId: string }
  | { type: "navigate"; path: string };
