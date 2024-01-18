import Browser from "webextension-polyfill";

export const getVersion = (): string => {
  return Browser.runtime.getManifest().version;
};
