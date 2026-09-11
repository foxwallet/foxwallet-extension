import { initializeBackgroundStore } from "./store/redux";
import { PortName } from "../../common/types/port";
import { Connection } from "../../common/utils/connection";
import { ContentServerHandler } from "./handlers/ContentServerHandler";
import { keepAliveHandler } from "./handlers/KeepaliveHandler";
import { PopupServerHandler } from "./handlers/PopupServerHandler";
import { ContentWalletServer } from "./servers/ContentServer";
import { PopupWalletServer } from "./servers/PopupServer";
import { DappStorage } from "./store/dapp/DappStorage";
import { AuthManager } from "./store/vault/managers/auth/AuthManager";
import { KeyringManager } from "./store/vault/managers/keyring/KeyringManager";
import { extensionInfoDB } from "@/database/ExtensionDatabase";
import {
  compareVersion,
  getVersion,
  parseVersion,
} from "@/common/utils/version";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { clearSwrCache } from "@/common/utils/indexeddb";
import { accountSettingStorage } from "./store/account/AccountStorage";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import {
  provableScannerService,
  recordSyncService,
} from "core/coins/ALEO/service/scanner";
import { AleoStorage } from "./store/aleo/AleoStorage";
import { encryptRegistrationViaOffscreen } from "./scannerOffscreen";
import { CoinType } from "core/types";
import { confirmUI } from "./helper/confirmUI";
import { applyWalletUIMode } from "./helper/uiMode";
import { WalletUIMode } from "@/store/setting";

export function startBackground() {
  confirmUI.start();
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "restore-sidepanel") return;
    setTimeout(() => {
      void chrome.sidePanel
        .setOptions({ enabled: true, path: "sidepanel.html" })
        .catch((error) => {
          console.error("Could not restore the wallet side panel", error);
        });
    }, 300);
  });
  const stateService = initializeBackgroundStore();
  confirmUI.setPanelEnabled(
    () =>
      (stateService.store.getState().setting.uiMode ??
        WalletUIMode.SidePanel) === WalletUIMode.SidePanel,
  );
  void stateService.ready
    .then(async () => {
      let currentMode =
        stateService.store.getState().setting.uiMode ?? WalletUIMode.SidePanel;
      const applyMode = async (mode: WalletUIMode) => {
        try {
          await applyWalletUIMode(mode);
        } catch (error) {
          console.error("Could not apply wallet UI mode", error);
        }
      };
      await applyMode(currentMode);
      stateService.store.subscribe(() => {
        const nextMode =
          stateService.store.getState().setting.uiMode ??
          WalletUIMode.SidePanel;
        if (nextMode === currentMode) return;
        currentMode = nextMode;
        void applyMode(nextMode);
      });
    })
    .catch(() => {
      void applyWalletUIMode(WalletUIMode.SidePanel).catch((error) => {
        console.error("Could not enable the wallet side panel", error);
      });
    });
  const keepAliveConnection = new Connection(
    keepAliveHandler,
    PortName.KEEP_ALIVE,
  );
  keepAliveConnection.connect();

  const authManager = new AuthManager();
  keyringManager = new KeyringManager(authManager);
  const dappStorage = new DappStorage();
  const coinService = coinServiceEntry;

  popupWalletServer = new PopupWalletServer(
    authManager,
    keyringManager,
    dappStorage,
    accountSettingStorage,
    coinService,
  );

  const popupServerHandler = new PopupServerHandler(popupWalletServer);
  provableScannerService.configure({
    encryptRegistration: encryptRegistrationViaOffscreen,
    resolveRegisterRequest: async ({ address }) => {
      try {
        const viewKey = await keyringManager.getViewKey({
          coinType: CoinType.ALEO,
          address,
        });
        if (!viewKey) {
          return undefined;
        }
        return {
          start: 0,
          viewKey,
        };
      } catch (error) {
        console.warn("[RSS] scanner re-registration resolver failed", {
          address,
          error,
        });
        return undefined;
      }
    },
  });
  recordSyncService.configure({
    aleoStorage: AleoStorage.getInstance(),
    defaultChainId: InnerChainUniqueId.ALEO_MAINNET,
    shouldSkip: () =>
      !popupServerHandler.hasActivePort() || !authManager.hasAuth(),
  });

  contentWalletServer = new ContentWalletServer(
    authManager,
    keyringManager,
    dappStorage,
    accountSettingStorage,
    popupWalletServer,
    coinService,
  );

  contentServerHandler = new ContentServerHandler(contentWalletServer);

  const popupConnection = new Connection(
    popupServerHandler,
    PortName.POPUP_TO_BACKGROUND,
  );
  popupConnection.connect();

  const contentConnection = new Connection(
    contentServerHandler,
    PortName.CONTENT_TO_BACKGROUND,
  );
  contentConnection.connect();

  async function checkVersion() {
    const existVersion = await extensionInfoDB.getVersion();
    const currentVersion = getVersion();
    if (existVersion) {
      // 之前的版本如果是0.12.3及之前的版本，需要重置测试网数据
      const beforeTestnetReset = compareVersion(existVersion, "0.12.4") < 1;

      console.log(
        "===> checkVersion ",
        existVersion,
        currentVersion,
        beforeTestnetReset,
      );
      // if (beforeTestnetReset) {
      //   await coinService
      //     .getInstance(InnerChainUniqueId.ALEO_TESTNET)
      //     .resetChainData();
      //   await clearSwrCache();
      // }
    }
    if (existVersion !== currentVersion) {
      await extensionInfoDB.setVersion(currentVersion);
    }
  }

  checkVersion().finally(() => {
    console.log("===> checkVersion done");
  });
}

export let keyringManager: KeyringManager;
export let popupWalletServer: PopupWalletServer;
export let contentWalletServer: ContentWalletServer;
export let contentServerHandler: ContentServerHandler;
