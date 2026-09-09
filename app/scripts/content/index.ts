import { PortName } from "../../common/types/port";
import { KeepAliveClient } from "../../common/utils/client";
import { logger } from "../../common/utils/logger";
import { ContentClient } from "./ContentClient";
import { ContentBridge } from "./ContentBridge";

const inject = () => {
  const script = document.createElement("script");
  const url = chrome.runtime.getURL("injector.js");
  script.setAttribute("src", url);
  script.setAttribute("type", "module");
  const container = document.head || document.documentElement;
  container.insertBefore(script, container.firstElementChild);
  container.removeChild(script);
};

const keepAliveClient = new KeepAliveClient(PortName.CONTENT_TO_BACKGROUND);
logger.log("===> Content script init success");

const contentClient = new ContentClient((data) => bridge.emit(data));
const bridge = new ContentBridge(contentClient);

inject();
