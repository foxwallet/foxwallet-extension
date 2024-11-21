import { FOX_DAPP_REQUEST, FOX_DAPP_RESP } from "@/common/constants";
import { PortName } from "../../common/types/port";
import { KeepAliveClient } from "../../common/utils/client";
import { logger } from "../../common/utils/logger";
import { ContentClient } from "./ContentClient";
import { RequestParams } from './type';
import { getSiteInfo } from "./host";

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

const contentClient = new ContentClient();

// @ts-ignore custom event
window.addEventListener(
  FOX_DAPP_REQUEST,
  async (event: { detail: RequestParams }) => {
    const detail = event.detail;
    if (!detail) {
      throw new Error("Invalid event detail");
    }
    const { id, method, payload, metadata } = detail;
    const siteInfo = getSiteInfo();
    const result = await contentClient.send(method, payload, {
      siteInfo,
      ...metadata,
    });
    const customEvent = new CustomEvent(FOX_DAPP_RESP, {
      detail: {
        id,
        ...result,
      },
    });
    window.dispatchEvent(customEvent);
  },
);

inject();
