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
