import { BigNumber } from "ethers";

export function parseWalletCoreResp<T>(rawStr: string): {
  error: string;
  data: T;
} {
  const obj: { error: string; data: T } = JSON.parse(rawStr);
  return obj;
}

export function stringToHex(str: string) {
  let hexStr = "";
  for (let i = 0; i < str.length; i++) {
    hexStr += str.charCodeAt(i).toString(16);
  }
  return hexStr;
}

export const parseU64 = (value: string): BigNumber => {
  if (!value) {
    return BigNumber.from(0);
  }
  try {
    const numStr = value.split(".")[0];
    return BigNumber.from(numStr.slice(0, -3));
  } catch (err) {
    console.error("===> parseU64 error: ", err);
    return BigNumber.from(0);
  }
};

export const parseU128 = (value: string): BigNumber => {
  if (!value) {
    return BigNumber.from(0);
  }
  try {
    const numStr = value.split(".")[0];
    return BigNumber.from(numStr.slice(0, -4));
  } catch (err) {
    console.error("===> parseU128 error: ", err);
    return BigNumber.from(0);
  }
};

export const parseAleoFeeFuture = (futureStr?: string): string => {
  if (!futureStr) return "";
  const regex = /aleo1\w*/g;
  const matches = futureStr.match(regex);
  return matches ? matches[0] : "";
};

// export const parseBetaStakingState = (str: string): StateRespBody | null => {
//   try {
//     const regex = /(\w+):\s*(\d+)u64/g;
//     let match;
//     const result: Partial<StateRespBody> = {};
//
//     while ((match = regex.exec(str)) !== null) {
//       const key = match[1] as keyof StateRespBody;
//       const value = match[2];
//       result[key] = value;
//     }
//
//     if (Object.keys(result).length !== 4) {
//       return null;
//     }
//
//     return result;
//   } catch (err) {
//     console.error("parseBetaStakingState ", err);
//     return null;
//   }
// };
