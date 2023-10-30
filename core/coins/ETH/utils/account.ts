import { Wallet, type BytesLike } from "ethers";

export const stripHexPrefix = (address: string) => {
  if (address.startsWith("0x")) {
    address = address.replace("0x", "");
  }
  return address;
};

export function isValidPrivateKey(privateKey: BytesLike): boolean {
  try {
    new Wallet(privateKey);
    return true;
  } catch (error) {
    return false;
  }
}
