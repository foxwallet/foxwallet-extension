import { PortName } from "../../common/types/port";
import { Connection, IHandler } from "../../common/utils/connection";
import { contentServerHandler } from "./handlers/ContentServerHandler";
import { keepAliveHandler } from "./handlers/KeepaliveHandler";
import { popupServerHandler } from "./handlers/PopupServerHandler";

const keepAliveConnection = new Connection(
  keepAliveHandler,
  PortName.KEEP_ALIVE
);

const popupConnection = new Connection(
  popupServerHandler,
  PortName.POPUP_TO_BACKGROUND
);

const contentConnection = new Connection(
  contentServerHandler,
  PortName.CONTENT_TO_BACKGROUND
);

keepAliveConnection.connect();

popupConnection.connect();

contentConnection.connect();
