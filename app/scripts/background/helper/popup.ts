import { POPUP_HEIGHT, POPUP_WIDTH } from "@/common/constants/style";
import browser from "webextension-polyfill";

const WIDTH = POPUP_WIDTH;
const HEIGHT = POPUP_HEIGHT + 20;

export const getExistPopup = async (): Promise<
  browser.Tabs.Tab | undefined
> => {
  const tabs = await browser.tabs.query({
    url: [browser.runtime.getURL("/*")],
  });
  return tabs[0];
};

export const openPopup = async (url: string, params?: Record<string, any>) => {
  const existPopup = await getExistPopup();

  if (existPopup?.windowId) {
    return browser.windows.update(existPopup.windowId, { focused: true });
  }

  return createPopup(url, params);
};

export const createPopup = async (
  url: string,
  params?: Record<string, any>,
) => {
  const formatUrl = browser.runtime.getURL(`index.html#${url}`);
  const query = params ? "?" + new URLSearchParams(params).toString() : "";

  const finalUrl = `${formatUrl}${query}`;
  const {
    width = 0,
    left = 0,
    top = 0,
  } = await browser.windows.getLastFocused();

  const newLeft = Math.floor(left + width - WIDTH);

  const popup = await browser.windows.create({
    url: finalUrl,
    type: "popup",
    focused: true,
    top,
    left: newLeft,
    width: WIDTH,
    height: HEIGHT,
  });

  return popup;
};
