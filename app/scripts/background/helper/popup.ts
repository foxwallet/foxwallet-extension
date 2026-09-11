import browser from "webextension-polyfill";
import { confirmUI } from "./confirmUI";
import { createNotification } from "./notification";

export const getExistPopup = async (): Promise<
  browser.Tabs.Tab | undefined
> => {
  const tabs = await browser.tabs.query({
    url: [browser.runtime.getURL("index.html")],
  });
  return tabs[0];
};

export const openPopup = async (url: string, params?: Record<string, any>) => {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  if (await confirmUI.navigate(`${url}${query}`)) return;
  const existPopup = await getExistPopup();

  if (existPopup?.windowId) {
    return browser.windows.update(existPopup.windowId, { focused: true });
  }

  return createNotification(url, params);
};
