import { coinServiceEntry } from "@/services/coin/CoinService";
import { PortName } from "../../common/types/port";
import { Connection } from "../../common/utils/connection";
import { offscreen } from "./aleo";
import { ContentServerHandler } from "./handlers/ContentServerHandler";
import { keepAliveHandler } from "./handlers/KeepaliveHandler";
import { PopupServerHandler } from "./handlers/PopupServerHandler";
import { ContentWalletServer } from "./servers/ContentServer";
import { PopupWalletServer } from "./servers/PopupServer";
import { AccountSettingStorage } from "./store/account/AccountStorage";
import { DappStorage } from "./store/dapp/DappStorage";
import { AuthManager } from "./store/vault/managers/auth/AuthManager";
import { KeyringManager } from "./store/vault/managers/keyring/KeyringManager";

const keepAliveConnection = new Connection(
  keepAliveHandler,
  PortName.KEEP_ALIVE,
);
keepAliveConnection.connect();

const accountSettingStorage = AccountSettingStorage.getInstance();
const authManager = new AuthManager();
const keyringManager = new KeyringManager(authManager);
keyringManager.init();
const dappStorage = new DappStorage();
const coinService = coinServiceEntry;

export const popupWalletServer = new PopupWalletServer(
  authManager,
  keyringManager,
  dappStorage,
  accountSettingStorage,
  coinService,
);

const popupServerHandler = new PopupServerHandler(popupWalletServer);

export const contentWalletServer = new ContentWalletServer(
  authManager,
  keyringManager,
  dappStorage,
  accountSettingStorage,
  popupWalletServer,
  coinService,
);

const contentServerHandler = new ContentServerHandler(contentWalletServer);

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

offscreen();
