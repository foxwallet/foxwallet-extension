import { stripHexPrefix } from "ethereumjs-util";

export const isSameAddress = (
  ad1: string | undefined,
  ad2: string | undefined,
): boolean => {
  return (
    stripHexPrefix(ad1 ?? "").toLowerCase() ===
    stripHexPrefix(ad2 ?? "").toLowerCase()
  );
};
