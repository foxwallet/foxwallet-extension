import { PortName } from "../../common/types/port";
import { Connection } from "../../common/utils/connection";
import { contentServerHandler } from "./handlers/ContentServerHandler";
import { keepAliveHandler } from "./handlers/KeepaliveHandler";
import { PopupServerHandler } from "./handlers/PopupServerHandler";
import { PopupWalletServer } from "./servers/PopupServer";
import { AuthManager } from "./store/vault/managers/auth/AuthManager";
import { KeyringManager } from "./store/vault/managers/keyring/KeyringManager";
import { sync } from "./offscreen_helper";

const keepAliveConnection = new Connection(
  keepAliveHandler,
  PortName.KEEP_ALIVE
);
keepAliveConnection.connect();

const authManager = new AuthManager();
const keyringManager = new KeyringManager(authManager);
keyringManager.init();

export const popupWalletServer = new PopupWalletServer(
  authManager,
  keyringManager
);

const popupServerHandler = new PopupServerHandler(popupWalletServer);

const popupConnection = new Connection(
  popupServerHandler,
  PortName.POPUP_TO_BACKGROUND
);
popupConnection.connect();

const contentConnection = new Connection(
  contentServerHandler,
  PortName.CONTENT_TO_BACKGROUND
);
contentConnection.connect();

sync();
