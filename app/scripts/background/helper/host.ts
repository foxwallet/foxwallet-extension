import browser from "webextension-polyfill";

export const getActiveTabHost = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];
  if (tab?.url) {
    const url = new URL(tab.url);
    return url.host;
  }
  return null;
};
