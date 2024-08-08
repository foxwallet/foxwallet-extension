import Browser from "webextension-polyfill";

export const getVersion = (): string => {
  return Browser.runtime.getManifest().version;
};

export const parseVersion = (version: string): number[] => {
  return version.split(".").map((v) => parseInt(v));
};

export const compareVersion = (v1: string, v2: string): number => {
  const v1Arr = parseVersion(v1);
  const v2Arr = parseVersion(v2);

  for (let i = 0; i < v1Arr.length; i++) {
    if (v1Arr[i] > v2Arr[i]) {
      return 1;
    } else if (v1Arr[i] < v2Arr[i]) {
      return -1;
    }
  }

  return 0;
};
