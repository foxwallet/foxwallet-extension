import { POPUP_HEIGHT, POPUP_WIDTH } from "@/common/constants/style";
import browser from "webextension-polyfill";

export async function createNotification(
  path: string,
  params?: Record<string, string>,
) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const {
    width = POPUP_WIDTH,
    left = 0,
    top = 0,
  } = await browser.windows.getLastFocused();
  return browser.windows.create({
    url: browser.runtime.getURL(`notification.html#${path}${query}`),
    type: "popup",
    focused: true,
    top,
    left: Math.floor(left + width - POPUP_WIDTH),
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT + 20,
  });
}
