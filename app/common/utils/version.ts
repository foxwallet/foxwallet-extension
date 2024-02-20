import Browser from "webextension-polyfill";

export const getVersion = (): string => {
  return Browser.runtime.getManifest().version;
};

export const parseVersion = (version: string): number[] => {
  return version.split(".").map((v) => parseInt(v));
};
