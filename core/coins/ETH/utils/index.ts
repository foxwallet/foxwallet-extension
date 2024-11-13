export const stripHexPrefix = (address: string) => {
  if (address.startsWith("0x")) {
    address = address.replace("0x", "");
  }
  return address;
};
