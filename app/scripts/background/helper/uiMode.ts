import { WalletUIMode } from "@/store/setting";

export async function applyWalletUIMode(
  mode: WalletUIMode,
  api: Pick<typeof chrome, "action" | "sidePanel"> = chrome,
) {
  if (mode === WalletUIMode.Popup) {
    await api.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    await api.action.setPopup({ popup: "index.html" });
    return;
  }

  await api.action.setPopup({ popup: "" });
  await api.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await api.sidePanel.setOptions({ enabled: true, path: "sidepanel.html" });
}
