import { stripHexPrefix } from "core/coins/ETH/utils";

export function stringToHex(str: string) {
  let hexStr = "";
  for (let i = 0; i < str.length; i++) {
    hexStr += str.charCodeAt(i).toString(16);
  }
  return hexStr;
}

export function hexToString(hex: string) {
  try {
    hex = hex.replace(/^0x/, "");
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
    }
    return str;
  } catch (err) {
    console.error("hexToString error:", err);
    return hex;
  }
}

export const hexify = (data: string) => {
  if (data.startsWith("0x")) {
    return data;
  }
  return `0x${Buffer.from(data, "utf-8").toString("hex")}`;
};

export function hexToBuffer(str: string): Buffer {
  if (!str) {
    return Buffer.from([]);
  }
  str = stripHexPrefix(str);
  return Buffer.from(str, "hex");
}
