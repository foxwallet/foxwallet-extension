import EthConstants from "../constants";

export const stripHexPrefix = (address: string) => {
  if (address.startsWith("0x")) {
    address = address.replace("0x", "");
  }
  return address;
};

export const isSafeChainId = (chainId: number) => {
  return (
    Number.isSafeInteger(chainId) &&
    chainId > 0 &&
    chainId <= EthConstants.MAX_SAFE_CHAIN_ID
  );
};

export const parseEthChainId = (
  chainId: string | number,
): { valid: boolean; chainId: number } => {
  if (typeof chainId === "number") {
    return { valid: isSafeChainId(chainId), chainId };
  }
  if (typeof chainId === "string") {
    try {
      let newId: number;
      if (chainId.toLowerCase().startsWith("0x")) {
        newId = parseInt(chainId, 16);
      } else {
        newId = parseInt(chainId, 10);
      }
      return {
        valid: isSafeChainId(newId),
        chainId: newId,
      };
    } catch (errr) {
      return { valid: false, chainId: 0 };
    }
  }
  return { valid: false, chainId };
};
