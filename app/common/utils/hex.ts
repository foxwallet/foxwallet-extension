export function stringToHex(str: string) {
  let hexStr = "";
  for (let i = 0; i < str.length; i++) {
    hexStr += str.charCodeAt(i).toString(16);
  }
  return hexStr;
}
