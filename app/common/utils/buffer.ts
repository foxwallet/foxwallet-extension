export function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters");
  }
  const arrayBuffer = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < arrayBuffer.length; i++) {
    const byteValue = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
    if (isNaN(byteValue)) {
      throw new Error("Invalid hex string");
    }
    arrayBuffer[i] = byteValue;
  }
  return arrayBuffer;
}
